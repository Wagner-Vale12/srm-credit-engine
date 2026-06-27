import { BadRequestException, Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PricingStrategyFactory } from './pricing-strategy.factory';
import {
  PricingSimulationInput,
  PricingSimulationResult,
} from './pricing.types';

@Injectable()
export class PricingService {
  private readonly daysInFinancialMonth = new Decimal(30);
  private readonly millisecondsPerDay = 1000 * 60 * 60 * 24;

  constructor(
    private readonly pricingStrategyFactory: PricingStrategyFactory,
    private readonly prisma: PrismaService,
  ) {}

  async simulate(
    input: PricingSimulationInput,
  ): Promise<PricingSimulationResult> {
    await this.ensureCurrencyExists(input.currencyCode);

    const strategy = this.pricingStrategyFactory.getStrategy(
      input.receivableType,
    );

    const faceValue = this.parsePositiveDecimal(input.faceValue, 'faceValue');
    const baseRateMonthly = this.parsePercentage(input.baseRateMonthly);
    const spreadMonthly = strategy.getMonthlySpread();

    const simulationDate = this.parseDate(input.simulationDate ?? new Date());
    const dueDate = this.parseDate(input.dueDate);

    const termDays = this.calculateTermDays(simulationDate, dueDate);
    const termInMonths = new Decimal(termDays).div(this.daysInFinancialMonth);

    const effectiveMonthlyRate = baseRateMonthly.plus(spreadMonthly);

    const discountFactor = new Decimal(1)
      .plus(effectiveMonthlyRate)
      .pow(termInMonths);

    const presentValue = faceValue.div(discountFactor);
    const discountAmount = faceValue.minus(presentValue);

    return {
      currencyCode: input.currencyCode,
      receivableType: input.receivableType,
      faceValue: this.formatMoney(faceValue),
      presentValue: this.formatMoney(presentValue),
      discountAmount: this.formatMoney(discountAmount),
      baseRateMonthly: this.formatRate(baseRateMonthly),
      spreadMonthly: this.formatRate(spreadMonthly),
      effectiveMonthlyRate: this.formatRate(effectiveMonthlyRate),
      termDays,
      termInMonths: termInMonths.toDecimalPlaces(4).toFixed(4),
    };
  }

  private async ensureCurrencyExists(currencyCode: string): Promise<void> {
    const currency = await this.prisma.currency.findUnique({
      where: {
        code: currencyCode,
      },
    });

    if (!currency) {
      throw new BadRequestException(`Currency not found: ${currencyCode}`);
    }
  }

  private parsePositiveDecimal(value: string, fieldName: string): Decimal {
    const decimal = new Decimal(value);

    if (!decimal.isFinite() || decimal.lte(0)) {
      throw new BadRequestException(`${fieldName} must be greater than zero`);
    }

    return decimal;
  }

  private parsePercentage(value: string): Decimal {
    const percentage = new Decimal(value);

    if (!percentage.isFinite() || percentage.lt(0)) {
      throw new BadRequestException('baseRateMonthly must be zero or greater');
    }

    return percentage.div(100);
  }

  private parseDate(value: string | Date): Date {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    return date;
  }

  private calculateTermDays(simulationDate: Date, dueDate: Date): number {
    const termDays = Math.ceil(
      (dueDate.getTime() - simulationDate.getTime()) / this.millisecondsPerDay,
    );

    if (termDays <= 0) {
      throw new BadRequestException(
        'dueDate must be greater than simulationDate',
      );
    }

    return termDays;
  }

  private formatMoney(value: Decimal): string {
    return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
  }

  private formatRate(value: Decimal): string {
    return value.mul(100).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed(4);
  }
}
