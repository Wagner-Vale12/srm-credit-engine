import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateSettlementDto {
  @ApiProperty({
    example: '6f5f5c4d-4f8b-4a4e-9f7b-5a2b1e7a9c90',
    description: 'Receivable identifier to be settled.',
  })
  @IsUUID()
  receivableId!: string;

  @ApiProperty({
    example: 'BRL',
    enum: ['BRL', 'USD'],
    description: 'Currency used to pay the settlement.',
  })
  @IsIn(['BRL', 'USD'])
  paymentCurrencyCode!: string;

  @ApiProperty({
    example: '1.00',
    description: 'Monthly base rate as percentage. Example: 1.00 means 1% p.m.',
  })
  @IsString()
  @Matches(/^\d+(\.\d{1,4})?$/, {
    message: 'baseRateMonthly must be a decimal string. Example: 1.00',
  })
  baseRateMonthly!: string;

  @ApiPropertyOptional({
    example: '2026-06-27',
    description: 'Settlement date. If omitted, current date is used.',
  })
  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @ApiPropertyOptional({
    example: 'system',
    description: 'Optional user identifier for audit logs.',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
