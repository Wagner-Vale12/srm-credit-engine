import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PricingReceivableType } from '../pricing.types';
import { PricingStrategy } from './pricing-strategy.interface';

@Injectable()
export class DuplicataMercantilStrategy implements PricingStrategy {
  readonly receivableType = PricingReceivableType.DUPLICATA_MERCANTIL;

  getMonthlySpread(): Decimal {
    return new Decimal('0.015');
  }
}
