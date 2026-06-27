import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../infrastructure/database/prisma.module';
import { PricingService } from '../../../application/pricing/pricing.service';
import { PricingStrategyFactory } from '../../../application/pricing/pricing-strategy.factory';
import { DuplicataMercantilStrategy } from '../../../application/pricing/strategies/duplicata-mercantil.strategy';
import { ChequePreDatadoStrategy } from '../../../application/pricing/strategies/cheque-pre-datado.strategy';
import { PricingController } from './pricing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PricingController],
  providers: [
    PricingService,
    PricingStrategyFactory,
    DuplicataMercantilStrategy,
    ChequePreDatadoStrategy,
  ],
  exports: [PricingService],
})
export class PricingModule {}
