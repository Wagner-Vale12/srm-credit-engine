import { HealthModule } from './presentation/http/health/health.module';
import { CurrenciesModule } from './presentation/http/currencies/currencies.module';
import { PricingModule } from './presentation/http/pricing/pricing.module';
import { SettlementsModule } from './presentation/http/settlements/settlements.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ObservabilityModule } from './shared/observability/observability.module';
import { CorrelationIdMiddleware } from './shared/observability/correlation-id.middleware';
import { ReceivablesModule } from './presentation/http/receivables/receivables.module';

@Module({
  imports: [
    HealthModule,
    CurrenciesModule,
    PricingModule,
    SettlementsModule,
    ObservabilityModule,
    ReceivablesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
