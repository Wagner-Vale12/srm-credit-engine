import { Module } from '@nestjs/common';
import { ReceivablesService } from '../../../application/receivables/receivables.service';
import { PrismaModule } from '../../../infrastructure/database/prisma.module';
import { ReceivablesController } from './receivables.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
