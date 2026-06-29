import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReceivableStatus, SettlementStatus } from '@prisma/client';
import Decimal from 'decimal.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PricingService } from '../../../application/pricing/pricing.service';
import { PricingReceivableType } from '../../../application/pricing/pricing.types';
import {
  CreateSettlementInput,
  ListSettlementsInput,
  PaginatedSettlements,
  SettlementReport,
  SettlementSummary,
} from './settlements.types';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  async create(input: CreateSettlementInput): Promise<SettlementSummary> {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await tx.receivable.findUnique({
        where: {
          id: input.receivableId,
        },
        include: {
          cedent: true,
          type: true,
          currency: true,
        },
      });

      if (!receivable) {
        throw new NotFoundException('Receivable not found');
      }

      if (receivable.status === ReceivableStatus.SETTLED) {
        throw new ConflictException('Receivable is already settled');
      }

      if (receivable.status === ReceivableStatus.CANCELLED) {
        throw new ConflictException('Cancelled receivable cannot be settled');
      }

      const paymentCurrency = await tx.currency.findUnique({
        where: {
          code: input.paymentCurrencyCode,
        },
      });

      if (!paymentCurrency) {
        throw new BadRequestException(
          `Payment currency not found: ${input.paymentCurrencyCode}`,
        );
      }

      const receivableType = this.mapReceivableTypeCode(receivable.type.code);

      const settlementDate = input.settlementDate
        ? new Date(input.settlementDate)
        : new Date();

      const pricing = await this.pricingService.simulate({
        faceValue: receivable.faceValue.toString(),
        currencyCode: receivable.currency.code,
        receivableType,
        baseRateMonthly: input.baseRateMonthly,
        simulationDate: this.toDateOnly(settlementDate),
        dueDate: this.toDateOnly(receivable.dueDate),
      });

      const presentValue = new Decimal(pricing.presentValue);
      const faceValue = new Decimal(pricing.faceValue);
      const discountAmount = faceValue.minus(presentValue);

      const conversion = await this.convertAmount({
        tx,
        amount: presentValue,
        fromCurrencyId: receivable.currencyId,
        fromCurrencyCode: receivable.currency.code,
        fromCurrencyIsBase: receivable.currency.isBase,
        toCurrencyId: paymentCurrency.id,
        toCurrencyCode: paymentCurrency.code,
        toCurrencyIsBase: paymentCurrency.isBase,
      });

      const updatedReceivable = await tx.receivable.updateMany({
        where: {
          id: receivable.id,
          version: receivable.version,
          status: {
            in: [ReceivableStatus.REGISTERED, ReceivableStatus.PRICED],
          },
        },
        data: {
          status: ReceivableStatus.SETTLED,
          version: {
            increment: 1,
          },
        },
      });

      if (updatedReceivable.count !== 1) {
        throw new ConflictException(
          'Receivable was modified by another operation. Please retry.',
        );
      }

      const settlement = await tx.settlement.create({
        data: {
          receivableId: receivable.id,
          settlementDate,
          presentValue: presentValue.toDecimalPlaces(6).toFixed(6),
          paymentCurrencyId: paymentCurrency.id,
          exchangeRate: conversion.exchangeRate
            ? conversion.exchangeRate.toDecimalPlaces(8).toFixed(8)
            : null,
          baseRate: new Decimal(pricing.baseRateMonthly)
            .div(100)
            .toDecimalPlaces(6)
            .toFixed(6),
          spreadPercent: new Decimal(pricing.spreadMonthly)
            .div(100)
            .toDecimalPlaces(6)
            .toFixed(6),
          status: SettlementStatus.CONFIRMED,
        },
      });

      const settlementItem = await tx.settlementItem.create({
        data: {
          settlementId: settlement.id,
          amount: conversion.convertedAmount.toDecimalPlaces(6).toFixed(6),
          currencyId: paymentCurrency.id,
        },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Settlement',
          entityId: settlement.id,
          action: 'CREATE_SETTLEMENT',
          oldValues: Prisma.JsonNull,
          newValues: {
            settlementId: settlement.id,
            receivableId: receivable.id,
            settlementItemId: settlementItem.id,
            receivableStatus: ReceivableStatus.SETTLED,
            paymentCurrencyCode: paymentCurrency.code,
            presentValue: pricing.presentValue,
            paymentAmount: conversion.convertedAmount
              .toDecimalPlaces(6)
              .toFixed(6),
          },
          userId: input.userId ?? 'system',
        },
      });

      return {
        settlementId: settlement.id,
        receivableId: receivable.id,
        cedentName: receivable.cedent.name,
        receivableType: receivable.type.code,
        receivableCurrency: receivable.currency.code,
        paymentCurrency: paymentCurrency.code,
        faceValue: this.formatMoney(faceValue),
        presentValue: this.formatMoney(presentValue),
        paymentAmount: this.formatMoney(conversion.convertedAmount),
        discountAmount: this.formatMoney(discountAmount),
        baseRateMonthly: pricing.baseRateMonthly,
        spreadMonthly: pricing.spreadMonthly,
        effectiveMonthlyRate: pricing.effectiveMonthlyRate,
        exchangeRate: conversion.exchangeRate
          ? conversion.exchangeRate.toDecimalPlaces(8).toFixed(8)
          : null,
        status: settlement.status,
        settlementDate: settlement.settlementDate.toISOString(),
      };
    });
  }

  async findAll(input: ListSettlementsInput = {}): Promise<PaginatedSettlements> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SettlementWhereInput = {};

    if (input.status) {
      where.status = input.status as Prisma.EnumSettlementStatusFilter;
    }

    if (input.currencyCode) {
      where.paymentCurrency = {
        code: input.currencyCode,
      };
    }

    if (input.receivableTypeCode || input.cedentId) {
      const receivableWhere: Prisma.ReceivableWhereInput = {
        ...(input.receivableTypeCode
          ? { type: { code: input.receivableTypeCode } }
          : {}),
        ...(input.cedentId ? { cedentId: input.cedentId } : {}),
      };
      where.receivable = receivableWhere;
    }

    if (input.settlementDateFrom || input.settlementDateTo) {
      where.settlementDate = {
        ...(input.settlementDateFrom ? { gte: new Date(input.settlementDateFrom) } : {}),
        ...(input.settlementDateTo
          ? { lte: this.toInclusiveEndDate(input.settlementDateTo) }
          : {}),
      };
    }

    const [total, settlements] = await this.prisma.$transaction([
      this.prisma.settlement.count({ where }),
      this.prisma.settlement.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          settlementDate: 'desc',
        },
        include: {
          paymentCurrency: true,
          items: {
            include: {
              currency: true,
            },
          },
          receivable: {
            include: {
              cedent: true,
              type: true,
              currency: true,
            },
          },
        },
      }),
    ]);

    return {
      data: settlements.map((settlement) => {
        const item = settlement.items[0];
        const faceValue = new Decimal(settlement.receivable.faceValue.toString());
        const presentValue = new Decimal(settlement.presentValue.toString());
        const paymentAmount = item
          ? new Decimal(item.amount.toString())
          : presentValue;
        const discountAmount = faceValue.minus(presentValue);

        return {
          settlementId: settlement.id,
          receivableId: settlement.receivable.id,
          cedentName: settlement.receivable.cedent.name,
          receivableType: settlement.receivable.type.code,
          receivableCurrency: settlement.receivable.currency.code,
          paymentCurrency: settlement.paymentCurrency.code,
          faceValue: this.formatMoney(faceValue),
          presentValue: this.formatMoney(presentValue),
          paymentAmount: this.formatMoney(paymentAmount),
          discountAmount: this.formatMoney(discountAmount),
          baseRateMonthly: new Decimal(settlement.baseRate.toString())
            .mul(100)
            .toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
            .toFixed(4),
          spreadMonthly: new Decimal(settlement.spreadPercent.toString())
            .mul(100)
            .toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
            .toFixed(4),
          effectiveMonthlyRate: this.formatRate(
            new Decimal(settlement.baseRate.toString())
              .mul(100)
              .plus(new Decimal(settlement.spreadPercent.toString()).mul(100)),
          ),
          exchangeRate: settlement.exchangeRate?.toString() ?? null,
          status: settlement.status,
          settlementDate: settlement.settlementDate.toISOString(),
        };
      }),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReport(settlementId: string): Promise<SettlementReport> {
    const settlement = await this.prisma.settlement.findUnique({
      where: {
        id: settlementId,
      },
      include: {
        paymentCurrency: true,
        items: {
          include: {
            currency: true,
          },
        },
        receivable: {
          include: {
            cedent: true,
            type: true,
            currency: true,
          },
        },
      },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    const item = settlement.items[0];
    const faceValue = new Decimal(settlement.receivable.faceValue.toString());
    const presentValue = new Decimal(settlement.presentValue.toString());
    const baseRateMonthly = new Decimal(settlement.baseRate.toString()).mul(100);
    const spreadMonthly = new Decimal(
      settlement.spreadPercent.toString(),
    ).mul(100);

    return {
      settlementId: settlement.id,
      status: settlement.status,
      settlementDate: settlement.settlementDate.toISOString(),
      cedent: {
        id: settlement.receivable.cedent.id,
        name: settlement.receivable.cedent.name,
        document: settlement.receivable.cedent.document,
      },
      receivable: {
        id: settlement.receivable.id,
        type: settlement.receivable.type.code,
        currency: settlement.receivable.currency.code,
        faceValue: this.formatMoney(faceValue),
        dueDate: this.toDateOnly(settlement.receivable.dueDate),
      },
      pricing: {
        presentValue: this.formatMoney(presentValue),
        discountAmount: this.formatMoney(faceValue.minus(presentValue)),
        baseRateMonthly: this.formatRate(baseRateMonthly),
        spreadMonthly: this.formatRate(spreadMonthly),
        effectiveMonthlyRate: this.formatRate(
          baseRateMonthly.plus(spreadMonthly),
        ),
      },
      payment: {
        currency: item?.currency.code ?? settlement.paymentCurrency.code,
        amount: this.formatMoney(
          item ? new Decimal(item.amount.toString()) : presentValue,
        ),
        exchangeRate: settlement.exchangeRate?.toString() ?? null,
      },
    };
  }

  private mapReceivableTypeCode(code: string): PricingReceivableType {
    if (code === PricingReceivableType.DUPLICATA_MERCANTIL) {
      return PricingReceivableType.DUPLICATA_MERCANTIL;
    }

    if (code === PricingReceivableType.CHEQUE_PRE_DATADO) {
      return PricingReceivableType.CHEQUE_PRE_DATADO;
    }

    throw new BadRequestException(`Unsupported receivable type: ${code}`);
  }

  private async convertAmount(params: {
    tx: Prisma.TransactionClient;
    amount: Decimal;
    fromCurrencyId: string;
    fromCurrencyCode: string;
    fromCurrencyIsBase: boolean;
    toCurrencyId: string;
    toCurrencyCode: string;
    toCurrencyIsBase: boolean;
  }): Promise<{
    convertedAmount: Decimal;
    exchangeRate: Decimal | null;
  }> {
    if (params.fromCurrencyId === params.toCurrencyId) {
      return {
        convertedAmount: params.amount,
        exchangeRate: null,
      };
    }

    if (!params.fromCurrencyIsBase && params.toCurrencyIsBase) {
      const rate = await this.getLatestExchangeRate(
        params.tx,
        params.fromCurrencyId,
      );

      return {
        convertedAmount: params.amount.mul(rate),
        exchangeRate: rate,
      };
    }

    if (params.fromCurrencyIsBase && !params.toCurrencyIsBase) {
      const rate = await this.getLatestExchangeRate(
        params.tx,
        params.toCurrencyId,
      );

      return {
        convertedAmount: params.amount.div(rate),
        exchangeRate: rate,
      };
    }

    const fromRate = await this.getLatestExchangeRate(
      params.tx,
      params.fromCurrencyId,
    );

    const toRate = await this.getLatestExchangeRate(
      params.tx,
      params.toCurrencyId,
    );

    const crossRate = fromRate.div(toRate);

    return {
      convertedAmount: params.amount.mul(crossRate),
      exchangeRate: crossRate,
    };
  }

  private async getLatestExchangeRate(
    tx: Prisma.TransactionClient,
    currencyId: string,
  ): Promise<Decimal> {
    const exchangeRate = await tx.exchangeRate.findFirst({
      where: {
        currencyId,
      },
      orderBy: {
        rateDate: 'desc',
      },
    });

    if (!exchangeRate) {
      throw new BadRequestException('Exchange rate not found');
    }

    return new Decimal(exchangeRate.rate.toString());
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private toInclusiveEndDate(value: string): Date {
    return new Date(value.length === 10 ? `${value}T23:59:59.999Z` : value);
  }

  private formatMoney(value: Decimal): string {
    return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
  }

  private formatRate(value: Decimal): string {
    return value.toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed(4);
  }
}
