/// <reference types="jest" />

import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PricingStrategyFactory } from './pricing-strategy.factory';
import { PricingService } from './pricing.service';
import { PricingReceivableType } from './pricing.types';
import { ChequePreDatadoStrategy } from './strategies/cheque-pre-datado.strategy';
import { DuplicataMercantilStrategy } from './strategies/duplicata-mercantil.strategy';

describe('PricingService', () => {
  let service: PricingService;

  const currencyFindUniqueMock = jest.fn();

  const prismaMock = {
    currency: {
      findUnique: currencyFindUniqueMock,
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();

    const strategyFactory = new PricingStrategyFactory(
      new DuplicataMercantilStrategy(),
      new ChequePreDatadoStrategy(),
    );

    service = new PricingService(strategyFactory, prismaMock);
  });

  it('should simulate pricing for Duplicata Mercantil using 1.5% monthly spread', async () => {
    currencyFindUniqueMock.mockResolvedValue({
      id: 'currency-id',
      code: 'BRL',
      name: 'Brazilian Real',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.simulate({
      faceValue: '10000.00',
      currencyCode: 'BRL',
      receivableType: PricingReceivableType.DUPLICATA_MERCANTIL,
      baseRateMonthly: '1.00',
      simulationDate: '2026-06-26',
      dueDate: '2026-07-26',
    });

    expect(result).toEqual({
      currencyCode: 'BRL',
      receivableType: PricingReceivableType.DUPLICATA_MERCANTIL,
      faceValue: '10000.00',
      presentValue: '9756.10',
      discountAmount: '243.90',
      baseRateMonthly: '1.0000',
      spreadMonthly: '1.5000',
      effectiveMonthlyRate: '2.5000',
      termDays: 30,
      termInMonths: '1.0000',
    });

    expect(currencyFindUniqueMock).toHaveBeenCalledWith({
      where: {
        code: 'BRL',
      },
    });
  });

  it('should simulate pricing for Cheque Pre-Datado using 2.5% monthly spread', async () => {
    currencyFindUniqueMock.mockResolvedValue({
      id: 'currency-id',
      code: 'BRL',
      name: 'Brazilian Real',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.simulate({
      faceValue: '10000.00',
      currencyCode: 'BRL',
      receivableType: PricingReceivableType.CHEQUE_PRE_DATADO,
      baseRateMonthly: '1.00',
      simulationDate: '2026-06-26',
      dueDate: '2026-07-26',
    });

    expect(result.presentValue).toBe('9661.84');
    expect(result.discountAmount).toBe('338.16');
    expect(result.spreadMonthly).toBe('2.5000');
    expect(result.effectiveMonthlyRate).toBe('3.5000');
    expect(result.termDays).toBe(30);
    expect(result.termInMonths).toBe('1.0000');
  });

  it('should reject dueDate less than or equal to simulationDate', async () => {
    currencyFindUniqueMock.mockResolvedValue({
      id: 'currency-id',
      code: 'BRL',
      name: 'Brazilian Real',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.simulate({
        faceValue: '10000.00',
        currencyCode: 'BRL',
        receivableType: PricingReceivableType.DUPLICATA_MERCANTIL,
        baseRateMonthly: '1.00',
        simulationDate: '2026-06-26',
        dueDate: '2026-06-26',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject unknown currency', async () => {
    currencyFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.simulate({
        faceValue: '10000.00',
        currencyCode: 'EUR',
        receivableType: PricingReceivableType.DUPLICATA_MERCANTIL,
        baseRateMonthly: '1.00',
        simulationDate: '2026-06-26',
        dueDate: '2026-07-26',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject faceValue less than or equal to zero', async () => {
    currencyFindUniqueMock.mockResolvedValue({
      id: 'currency-id',
      code: 'BRL',
      name: 'Brazilian Real',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.simulate({
        faceValue: '0',
        currencyCode: 'BRL',
        receivableType: PricingReceivableType.DUPLICATA_MERCANTIL,
        baseRateMonthly: '1.00',
        simulationDate: '2026-06-26',
        dueDate: '2026-07-26',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
