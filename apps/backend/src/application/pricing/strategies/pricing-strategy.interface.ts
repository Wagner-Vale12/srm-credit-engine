import Decimal from 'decimal.js';
import { PricingReceivableType } from '../pricing.types';

export interface PricingStrategy {
  readonly receivableType: PricingReceivableType;

  getMonthlySpread(): Decimal;
}
