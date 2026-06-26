import { Module } from '@nestjs/common';
import { CurrenciesService } from '../../../application/currencies/currencies.service';
import { PrismaModule } from '../../../infrastructure/database/prisma.module';
import { CurrenciesController } from './currencies.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
})
export class CurrenciesModule {}
