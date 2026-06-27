import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PricingReceivableType } from '../pricing.types';
import { PricingStrategy } from './pricing-strategy.interface';

@Injectable()
export class ChequePreDatadoStrategy implements PricingStrategy {
  readonly receivableType = PricingReceivableType.CHEQUE_PRE_DATADO;

  getMonthlySpread(): Decimal {
    return new Decimal('0.025');
  }
}
