import { Module } from '@nestjs/common';
import { HealthModule } from './presentation/http/health/health.module';
import { CurrenciesModule } from './presentation/http/currencies/currencies.module';

@Module({
  imports: [HealthModule, CurrenciesModule],
})
export class AppModule {}
