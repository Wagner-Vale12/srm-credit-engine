import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrenciesService } from '../../../application/currencies/currencies.service';
import { UpsertExchangeRateDto } from './dto/upsert-exchange-rate.dto';

@ApiTags('Currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({
    summary: 'List supported currencies',
    description:
      'Returns all currencies registered in the platform. These currencies are used by receivables, pricing simulations and settlements.',
  })
  @ApiOkResponse({
    description: 'Currencies returned successfully.',
    schema: {
      example: [
        {
          id: '1e3f6a3a-5f2a-4a9e-8b28-8b8b4d5c1234',
          code: 'BRL',
          name: 'Brazilian Real',
          symbol: 'R$',
          isBase: true,
        },
        {
          id: '7c3a4f6a-2b91-4f32-9ad1-4e5c9b7d5678',
          code: 'USD',
          name: 'United States Dollar',
          symbol: '$',
          isBase: false,
        },
      ],
    },
  })
  findAllCurrencies() {
    return this.currenciesService.findAllCurrencies();
  }

  @Get('rates/latest')
  @ApiOperation({
    summary: 'List latest exchange rates',
    description:
      'Returns the latest known exchange rate for each non-base currency. Used for multicurrency pricing and settlement flows.',
  })
  @ApiOkResponse({
    description: 'Latest exchange rates returned successfully.',
    schema: {
      example: [
        {
          currencyCode: 'USD',
          currencyName: 'United States Dollar',
          rate: '5.50000000',
          rateDate: '2026-06-26',
          source: 'mocked-provider',
        },
      ],
    },
  })
  findLatestExchangeRates() {
    return this.currenciesService.findLatestExchangeRates();
  }

  @Post('rates')
  @ApiOperation({
    summary: 'Create or update an exchange rate',
    description:
      'Creates or updates the exchange rate for a currency and reference date. This endpoint supports multicurrency pricing and settlement operations.',
  })
  @ApiCreatedResponse({
    description: 'Exchange rate created or updated successfully.',
    schema: {
      example: {
        currencyCode: 'USD',
        rate: '5.50000000',
        rateDate: '2026-06-26',
        source: 'mocked-provider',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid exchange rate input.',
    schema: {
      example: {
        statusCode: 400,
        error: 'Bad Request',
        message: [
          'rate must be a positive decimal string. Example: 5.50000000',
        ],
        path: '/api/v1/currencies/rates',
        method: 'POST',
        correlationId: 'example-correlation-id',
        timestamp: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  upsertExchangeRate(@Body() dto: UpsertExchangeRateDto) {
    return this.currenciesService.upsertExchangeRate(dto);
  }
}
