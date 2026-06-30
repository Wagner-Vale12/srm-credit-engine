/// <reference types="jest" />

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ReceivableStatus, SettlementStatus } from '@prisma/client';
import Decimal from 'decimal.js';

import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { PricingReceivableType } from '../pricing/pricing.types';
import { SettlementsService } from '../../presentation/http/settlements/settlements.service';

describe('SettlementsService', () => {
  let service: SettlementsService;

  const transactionMock = jest.fn();

  const receivableFindUniqueMock = jest.fn();
  const receivableUpdateManyMock = jest.fn();
  const currencyFindUniqueMock = jest.fn();
  const settlementCreateMock = jest.fn();
  const settlementFindUniqueMock = jest.fn();
  const settlementItemCreateMock = jest.fn();
  const auditLogCreateMock = jest.fn();
  const exchangeRateFindFirstMock = jest.fn();

  const pricingSimulateMock = jest.fn();

  const txMock = {
    receivable: {
      findUnique: receivableFindUniqueMock,
      updateMany: receivableUpdateManyMock,
    },
    currency: {
      findUnique: currencyFindUniqueMock,
    },
    settlement: {
      create: settlementCreateMock,
    },
    settlementItem: {
      create: settlementItemCreateMock,
    },
    auditLog: {
      create: auditLogCreateMock,
    },
    exchangeRate: {
      findFirst: exchangeRateFindFirstMock,
    },
  };

  const prismaMock = {
    $transaction: transactionMock,
    settlement: {
      findUnique: settlementFindUniqueMock,
    },
  } as unknown as PrismaService;

  const pricingServiceMock = {
    simulate: pricingSimulateMock,
  } as unknown as PricingService;

  const cedent = {
    id: 'e5a980cf-f8e9-4fbe-8f47-cdbddef28434',
    name: 'Cedente Demonstração LTDA',
    document: '12345678000190',
  };

  const receivableType = {
    id: '6bd8f39a-e3c9-4d71-853f-000000000001',
    code: PricingReceivableType.DUPLICATA_MERCANTIL,
  };

  const brlCurrency = {
    id: '0a1b3aec-7fc7-4322-b36c-000000000001',
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    isBase: true,
  };

  const receivable = {
    id: '58b6d169-a1af-443e-b293-993c33fb8e91',
    cedentId: cedent.id,
    typeId: receivableType.id,
    faceValue: new Decimal('100000.000000'),
    currencyId: brlCurrency.id,
    dueDate: new Date('2026-07-30T00:00:00.000Z'),
    status: ReceivableStatus.REGISTERED,
    version: 1,
    createdAt: new Date('2026-06-28T22:00:00.000Z'),
    updatedAt: new Date('2026-06-28T22:00:00.000Z'),
    cedent,
    type: receivableType,
    currency: brlCurrency,
  };

  const pricingResult = {
    currencyCode: 'BRL',
    receivableType: PricingReceivableType.DUPLICATA_MERCANTIL,
    faceValue: '100000.00',
    presentValue: '97304.52',
    discountAmount: '2695.48',
    baseRateMonthly: '1.0000',
    spreadMonthly: '1.5000',
    effectiveMonthlyRate: '2.5000',
    termDays: 33,
    termInMonths: '1.1000',
  };

  const settlement = {
    id: '9a4e1a22-7f41-43b4-8d90-000000000001',
    receivableId: receivable.id,
    settlementDate: new Date('2026-06-27T00:00:00.000Z'),
    presentValue: new Decimal('97304.520000'),
    paymentCurrencyId: brlCurrency.id,
    exchangeRate: null,
    baseRate: new Decimal('0.010000'),
    spreadPercent: new Decimal('0.015000'),
    status: SettlementStatus.CONFIRMED,
    version: 1,
    createdAt: new Date('2026-06-28T22:00:00.000Z'),
  };

  const settlementItem = {
    id: '8b9d4477-2e28-4622-9f59-000000000001',
    settlementId: settlement.id,
    amount: new Decimal('97304.520000'),
    currencyId: brlCurrency.id,
    createdAt: new Date('2026-06-28T22:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await
    transactionMock.mockImplementation(async (callback) => callback(txMock));

    service = new SettlementsService(prismaMock, pricingServiceMock);
  });

  it('should create a settlement successfully using an ACID transaction', async () => {
    receivableFindUniqueMock.mockResolvedValue(receivable);
    currencyFindUniqueMock.mockResolvedValue(brlCurrency);
    pricingSimulateMock.mockResolvedValue(pricingResult);
    receivableUpdateManyMock.mockResolvedValue({ count: 1 });
    settlementCreateMock.mockResolvedValue(settlement);
    settlementItemCreateMock.mockResolvedValue(settlementItem);
    auditLogCreateMock.mockResolvedValue({
      id: 'audit-log-id',
    });

    const result = await service.create({
      receivableId: receivable.id,
      paymentCurrencyCode: 'BRL',
      baseRateMonthly: '1.00',
      settlementDate: '2026-06-27',
      userId: 'system',
    });

    expect(transactionMock).toHaveBeenCalledTimes(1);

    expect(receivableFindUniqueMock).toHaveBeenCalledWith({
      where: {
        id: receivable.id,
      },
      include: {
        cedent: true,
        type: true,
        currency: true,
      },
    });

    expect(pricingSimulateMock).toHaveBeenCalledWith({
      faceValue: '100000',
      currencyCode: 'BRL',
      receivableType: PricingReceivableType.DUPLICATA_MERCANTIL,
      baseRateMonthly: '1.00',
      simulationDate: '2026-06-27',
      dueDate: '2026-07-30',
    });

    expect(receivableUpdateManyMock).toHaveBeenCalledWith({
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

    expect(settlementCreateMock).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        receivableId: receivable.id,
        presentValue: '97304.520000',
        paymentCurrencyId: brlCurrency.id,
        exchangeRate: null,
        baseRate: '0.010000',
        spreadPercent: '0.015000',
        status: SettlementStatus.CONFIRMED,
      }),
    });

    expect(settlementItemCreateMock).toHaveBeenCalledWith({
      data: {
        settlementId: settlement.id,
        amount: '97304.520000',
        currencyId: brlCurrency.id,
      },
    });

    expect(auditLogCreateMock).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        entity: 'Settlement',
        entityId: settlement.id,
        action: 'CREATE_SETTLEMENT',
        userId: 'system',
      }),
    });

    expect(result).toEqual({
      settlementId: settlement.id,
      receivableId: receivable.id,
      cedentName: 'Cedente Demonstração LTDA',
      receivableType: PricingReceivableType.DUPLICATA_MERCANTIL,
      receivableCurrency: 'BRL',
      paymentCurrency: 'BRL',
      faceValue: '100000.00',
      presentValue: '97304.52',
      paymentAmount: '97304.52',
      discountAmount: '2695.48',
      baseRateMonthly: '1.0000',
      spreadMonthly: '1.5000',
      effectiveMonthlyRate: '2.5000',
      exchangeRate: null,
      status: SettlementStatus.CONFIRMED,
      settlementDate: '2026-06-27T00:00:00.000Z',
    });
  });

  it('should reject when receivable does not exist', async () => {
    receivableFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.create({
        receivableId: receivable.id,
        paymentCurrencyCode: 'BRL',
        baseRateMonthly: '1.00',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should reject when receivable is already settled', async () => {
    receivableFindUniqueMock.mockResolvedValue({
      ...receivable,
      status: ReceivableStatus.SETTLED,
    });

    await expect(
      service.create({
        receivableId: receivable.id,
        paymentCurrencyCode: 'BRL',
        baseRateMonthly: '1.00',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject when receivable is cancelled', async () => {
    receivableFindUniqueMock.mockResolvedValue({
      ...receivable,
      status: ReceivableStatus.CANCELLED,
    });

    await expect(
      service.create({
        receivableId: receivable.id,
        paymentCurrencyCode: 'BRL',
        baseRateMonthly: '1.00',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject when payment currency does not exist', async () => {
    receivableFindUniqueMock.mockResolvedValue(receivable);
    currencyFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.create({
        receivableId: receivable.id,
        paymentCurrencyCode: 'EUR',
        baseRateMonthly: '1.00',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject when optimistic concurrency update fails', async () => {
    receivableFindUniqueMock.mockResolvedValue(receivable);
    currencyFindUniqueMock.mockResolvedValue(brlCurrency);
    pricingSimulateMock.mockResolvedValue(pricingResult);
    receivableUpdateManyMock.mockResolvedValue({ count: 0 });

    await expect(
      service.create({
        receivableId: receivable.id,
        paymentCurrencyCode: 'BRL',
        baseRateMonthly: '1.00',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should return settlement report', async () => {
    settlementFindUniqueMock.mockResolvedValue({
      ...settlement,
      paymentCurrency: brlCurrency,
      items: [
        {
          ...settlementItem,
          currency: brlCurrency,
        },
      ],
      receivable,
    });

    const result = await service.getReport(settlement.id);

    expect(settlementFindUniqueMock).toHaveBeenCalledWith({
      where: {
        id: settlement.id,
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

    expect(result).toEqual({
      settlementId: settlement.id,
      status: SettlementStatus.CONFIRMED,
      settlementDate: '2026-06-27T00:00:00.000Z',
      cedent: {
        id: cedent.id,
        name: cedent.name,
        document: cedent.document,
      },
      receivable: {
        id: receivable.id,
        type: PricingReceivableType.DUPLICATA_MERCANTIL,
        currency: 'BRL',
        faceValue: '100000.00',
        dueDate: '2026-07-30',
      },
      pricing: {
        presentValue: '97304.52',
        discountAmount: '2695.48',
        baseRateMonthly: '1.0000',
        spreadMonthly: '1.5000',
        effectiveMonthlyRate: '2.5000',
      },
      payment: {
        currency: 'BRL',
        amount: '97304.52',
        exchangeRate: null,
      },
    });
  });

  it('should reject when settlement report is not found', async () => {
    settlementFindUniqueMock.mockResolvedValue(null);

    await expect(service.getReport(settlement.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
