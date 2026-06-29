import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../infrastructure/database/prisma.module';
import { PricingModule } from '../pricing/pricing.module';

import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';
import { SettlementReportsController } from './settlement-reports.controller';

@Module({
  imports: [PrismaModule, PricingModule],
  controllers: [SettlementsController, SettlementReportsController],
  providers: [SettlementsService],
  exports: [SettlementsService],
})
export class SettlementsModule {}
