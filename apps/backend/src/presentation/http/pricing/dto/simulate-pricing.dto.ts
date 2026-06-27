import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PricingReceivableType } from '../../../../application/pricing/pricing.types';

export class SimulatePricingDto {
  @ApiProperty({
    example: '10000.00',
    description: 'Face value of the receivable.',
  })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'faceValue must be a positive decimal string. Example: 10000.00',
  })
  faceValue!: string;

  @ApiProperty({
    example: 'BRL',
    enum: ['BRL', 'USD'],
    description: 'Receivable currency.',
  })
  @IsIn(['BRL', 'USD'])
  currencyCode!: string;

  @ApiProperty({
    example: PricingReceivableType.DUPLICATA_MERCANTIL,
    enum: PricingReceivableType,
    description: 'Receivable type used to select the pricing strategy.',
  })
  @IsEnum(PricingReceivableType)
  receivableType!: PricingReceivableType;

  @ApiProperty({
    example: '1.00',
    description: 'Monthly base rate as percentage. Example: 1.00 means 1% p.m.',
  })
  @IsString()
  @Matches(/^\d+(\.\d{1,4})?$/, {
    message: 'baseRateMonthly must be a decimal string. Example: 1.00',
  })
  baseRateMonthly!: string;

  @ApiProperty({
    example: '2026-07-26',
    description: 'Receivable due date.',
  })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({
    example: '2026-06-26',
    description: 'Simulation date. If omitted, current date is used.',
  })
  @IsOptional()
  @IsDateString()
  simulationDate?: string;
}
