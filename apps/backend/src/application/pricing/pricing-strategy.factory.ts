import { BadRequestException, Injectable } from '@nestjs/common';
import { PricingReceivableType } from './pricing.types';
import { PricingStrategy } from './strategies/pricing-strategy.interface';
import { DuplicataMercantilStrategy } from './strategies/duplicata-mercantil.strategy';
import { ChequePreDatadoStrategy } from './strategies/cheque-pre-datado.strategy';

@Injectable()
export class PricingStrategyFactory {
  constructor(
    private readonly duplicataMercantilStrategy: DuplicataMercantilStrategy,
    private readonly chequePreDatadoStrategy: ChequePreDatadoStrategy,
  ) {}

  getStrategy(receivableType: PricingReceivableType): PricingStrategy {
    const strategies: Record<PricingReceivableType, PricingStrategy> = {
      [PricingReceivableType.DUPLICATA_MERCANTIL]:
        this.duplicataMercantilStrategy,
      [PricingReceivableType.CHEQUE_PRE_DATADO]: this.chequePreDatadoStrategy,
    };

    const strategy = strategies[receivableType];

    if (!strategy) {
      throw new BadRequestException(
        `Unsupported receivable type: ${receivableType}`,
      );
    }

    return strategy;
  }
}
