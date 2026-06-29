import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('Settlements')
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create settlement',
    description:
      'Settles a receivable using ACID transaction, Pricing Engine integration, settlement item creation, receivable status update and audit log registration.',
  })
  @ApiCreatedResponse({
    description: 'Settlement created successfully.',
    schema: {
      example: {
        settlementId: 'f4138d8a-e3c3-4bdc-8002-f51ea9d64268',
        receivableId: '5b2094da-53fe-43a6-99e7-ed67bbfadc4f',
        cedentName: 'Cedente Demonstração LTDA',
        receivableType: 'DUPLICATA_MERCANTIL',
        receivableCurrency: 'BRL',
        paymentCurrency: 'BRL',
        faceValue: '10000.00',
        presentValue: '9636.39',
        paymentAmount: '9636.39',
        discountAmount: '363.61',
        baseRateMonthly: '1.0000',
        spreadMonthly: '1.5000',
        effectiveMonthlyRate: '2.5000',
        exchangeRate: null,
        status: 'CONFIRMED',
        settlementDate: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid settlement input or business rule violation, such as attempting to settle an already settled receivable.',
    schema: {
      example: {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Receivable is not available for settlement',
        path: '/api/v1/settlements',
        method: 'POST',
        correlationId: 'example-correlation-id',
        timestamp: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Receivable or payment currency not found.',
    schema: {
      example: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Receivable not found',
        path: '/api/v1/settlements',
        method: 'POST',
        correlationId: 'example-correlation-id',
        timestamp: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  create(@Body() dto: CreateSettlementDto) {
    return this.settlementsService.create(dto);
  }

  @Get(':id/report')
  @ApiOperation({
    summary: 'Get settlement report',
    description:
      'Returns a settlement report with receivable, pricing, payment and auditability data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Settlement identifier.',
    example: 'f4138d8a-e3c3-4bdc-8002-f51ea9d64268',
  })
  @ApiOkResponse({
    description: 'Settlement report returned successfully.',
    schema: {
      example: {
        settlementId: 'f4138d8a-e3c3-4bdc-8002-f51ea9d64268',
        receivableId: '5b2094da-53fe-43a6-99e7-ed67bbfadc4f',
        cedentName: 'Cedente Demonstração LTDA',
        receivableType: 'DUPLICATA_MERCANTIL',
        receivableCurrency: 'BRL',
        paymentCurrency: 'BRL',
        faceValue: '10000.00',
        presentValue: '9636.39',
        paymentAmount: '9636.39',
        discountAmount: '363.61',
        baseRateMonthly: '1.0000',
        spreadMonthly: '1.5000',
        effectiveMonthlyRate: '2.5000',
        exchangeRate: null,
        status: 'CONFIRMED',
        settlementDate: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Settlement not found.',
    schema: {
      example: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Settlement not found',
        path: '/api/v1/settlements/f4138d8a-e3c3-4bdc-8002-f51ea9d64268/report',
        method: 'GET',
        correlationId: 'example-correlation-id',
        timestamp: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  getReport(@Param('id') id: string) {
    return this.settlementsService.getReport(id);
  }
}
