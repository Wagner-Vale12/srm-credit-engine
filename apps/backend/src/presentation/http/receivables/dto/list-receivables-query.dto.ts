import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListReceivablesQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number.',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page.',
    default: 10,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({
    example: 'REGISTERED',
    enum: ['REGISTERED', 'PRICED', 'SETTLED', 'CANCELLED'],
    description: 'Receivable status filter.',
  })
  @IsOptional()
  @IsIn(['REGISTERED', 'PRICED', 'SETTLED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    example: 'BRL',
    enum: ['BRL', 'USD'],
    description: 'Currency code filter.',
  })
  @IsOptional()
  @IsIn(['BRL', 'USD'])
  currencyCode?: string;

  @ApiPropertyOptional({
    example: 'DUPLICATA_MERCANTIL',
    enum: ['DUPLICATA_MERCANTIL', 'CHEQUE_PRE_DATADO'],
    description: 'Receivable type code filter.',
  })
  @IsOptional()
  @IsIn(['DUPLICATA_MERCANTIL', 'CHEQUE_PRE_DATADO'])
  receivableTypeCode?: string;

  @ApiPropertyOptional({
    example: '58b6d169-a1af-443e-b293-993c33fb8e91',
    description: 'Cedent identifier filter.',
  })
  @IsOptional()
  @IsUUID()
  cedentId?: string;

  @ApiPropertyOptional({
    example: '2026-07-01',
    description: 'Minimum due date filter.',
  })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Maximum due date filter.',
  })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;
}
