import { Module } from '@nestjs/common';
import { HealthModule } from './presentation/http/health/health.module';

@Module({
  imports: [HealthModule],
})
export class AppModule {}
