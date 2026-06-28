import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsString, IsUUID, Matches } from 'class-validator';

export class CreateReceivableDto {
  @ApiProperty({
    example: '58b6d169-a1af-443e-b293-993c33fb8e91',
    description: 'Cedent identifier.',
  })
  @IsUUID()
  cedentId!: string;

  @ApiProperty({
    example: 'DUPLICATA_MERCANTIL',
    enum: ['DUPLICATA_MERCANTIL', 'CHEQUE_PRE_DATADO'],
    description: 'Receivable type code.',
  })
  @IsIn(['DUPLICATA_MERCANTIL', 'CHEQUE_PRE_DATADO'])
  receivableTypeCode!: string;

  @ApiProperty({
    example: 'BRL',
    enum: ['BRL', 'USD'],
    description: 'Receivable currency code.',
  })
  @IsIn(['BRL', 'USD'])
  currencyCode!: string;

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
    example: '2026-07-30',
    description: 'Receivable due date.',
  })
  @IsDateString()
  dueDate!: string;
}
