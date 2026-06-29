import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

type UpsertExchangeRateInput = {
  currencyCode?: string;
  rate?: string | number;
  rateDate?: string;
  source?: string;
};

@Injectable()
export class CurrenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCurrencies() {
    const currencies = await this.prisma.currency.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    return currencies.map((currency) => ({
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isBase: currency.isBase,
      createdAt: currency.createdAt,
    }));
  }

  async findLatestExchangeRates() {
    const currencies = await this.prisma.currency.findMany({
      orderBy: {
        code: 'asc',
      },
      include: {
        exchangeRates: {
          orderBy: {
            rateDate: 'desc',
          },
          take: 1,
        },
      },
    });

    return currencies
      .filter((currency) => currency.exchangeRates.length > 0)
      .map((currency) => {
        const latestRate = currency.exchangeRates[0];

        return {
          currency: {
            id: currency.id,
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            isBase: currency.isBase,
          },
          rate: latestRate.rate.toString(),
          rateDate: latestRate.rateDate,
          source: latestRate.source,
        };
      });
  }

  async upsertExchangeRate(dto: UpsertExchangeRateInput) {
    if (!dto.currencyCode) {
      throw new BadRequestException('currencyCode is required');
    }

    if (dto.rate === undefined || dto.rate === null) {
      throw new BadRequestException('rate is required');
    }

    const rate = dto.rate.toString();

    const currency = await this.prisma.currency.findUnique({
      where: {
        code: dto.currencyCode,
      },
    });

    if (!currency) {
      throw new NotFoundException(`Currency ${dto.currencyCode} not found`);
    }

    const rateDate = dto.rateDate ? new Date(dto.rateDate) : new Date();

    const exchangeRate = await this.prisma.exchangeRate.upsert({
      where: {
        currencyId_rateDate: {
          currencyId: currency.id,
          rateDate,
        },
      },
      update: {
        rate,
        source: dto.source ?? 'frontend-mvp',
      },
      create: {
        currencyId: currency.id,
        rate,
        rateDate,
        source: dto.source ?? 'frontend-mvp',
      },
    });

    return {
      id: exchangeRate.id,
      currencyCode: currency.code,
      rate: exchangeRate.rate.toString(),
      rateDate: exchangeRate.rateDate,
      source: exchangeRate.source,
    };
  }
}
