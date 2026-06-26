import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrenciesService } from '../../../application/currencies/currencies.service';
import { UpsertExchangeRateDto } from './dto/upsert-exchange-rate.dto';

@ApiTags('Currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({
    summary: 'List supported currencies',
    description: 'Returns all currencies registered in the platform.',
  })
  @ApiResponse({
    status: 200,
    description: 'Currencies returned successfully.',
  })
  findAllCurrencies() {
    return this.currenciesService.findAllCurrencies();
  }

  @Get('rates/latest')
  @ApiOperation({
    summary: 'List latest exchange rates',
    description: 'Returns the latest known exchange rate for each currency.',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest exchange rates returned successfully.',
  })
  findLatestExchangeRates() {
    return this.currenciesService.findLatestExchangeRates();
  }

  @Post('rates')
  @ApiOperation({
    summary: 'Create or update an exchange rate',
    description:
      'Creates or updates the exchange rate for a currency and reference date.',
  })
  @ApiResponse({
    status: 201,
    description: 'Exchange rate created or updated successfully.',
  })
  upsertExchangeRate(@Body() dto: UpsertExchangeRateDto) {
    return this.currenciesService.upsertExchangeRate(dto);
  }
}
