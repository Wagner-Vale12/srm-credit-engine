import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrenciesService {
  findAllCurrencies() {
    return [];
  }

  findLatestExchangeRates() {
    return [];
  }

  upsertExchangeRate(dto: unknown) {
    return dto;
  }
}
