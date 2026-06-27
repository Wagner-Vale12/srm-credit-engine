import { Module } from '@nestjs/common';
import { HealthModule } from './presentation/http/health/health.module';
import { CurrenciesModule } from './presentation/http/currencies/currencies.module';
import { PricingModule } from './presentation/http/pricing/pricing.module';

@Module({
  imports: [HealthModule, CurrenciesModule, PricingModule],
})
export class AppModule {}
