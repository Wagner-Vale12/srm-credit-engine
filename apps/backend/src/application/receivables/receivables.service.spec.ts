/// <reference types="jest" />

import { BadRequestException, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ReceivablesService } from './receivables.service';

describe('ReceivablesService', () => {
  let service: ReceivablesService;

  const cedentFindUniqueMock = jest.fn();
  const receivableTypeFindUniqueMock = jest.fn();
  const currencyFindUniqueMock = jest.fn();
  const receivableCreateMock = jest.fn();
  const receivableFindManyMock = jest.fn();
  const receivableFindUniqueMock = jest.fn();

  const prismaMock = {
    cedent: {
      findUnique: cedentFindUniqueMock,
    },
    receivableType: {
      findUnique: receivableTypeFindUniqueMock,
    },
    currency: {
      findUnique: currencyFindUniqueMock,
    },
    receivable: {
      create: receivableCreateMock,
      findMany: receivableFindManyMock,
      findUnique: receivableFindUniqueMock,
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReceivablesService(prismaMock);
  });

  const cedent = {
    id: '58b6d169-a1af-443e-b293-993c33fb8e91',
    name: 'Cedente Demonstração LTDA',
  };

  const receivableType = {
    id: '6bd8f39a-e3c9-4d71-853f-000000000001',
    code: 'DUPLICATA_MERCANTIL',
  };

  const currency = {
    id: '0a1b3aec-7fc7-4322-b36c-000000000001',
    code: 'BRL',
  };

  const receivable = {
    id: '7a5e7f2d-6f3f-4d7c-a54f-000000000001',
    faceValue: new Decimal('25000.000000'),
    dueDate: new Date('2026-08-30T00:00:00.000Z'),
    status: 'REGISTERED',
    version: 1,
    createdAt: new Date('2026-06-28T22:00:00.000Z'),
    cedent,
    type: receivableType,
    currency,
  };

  it('should create a receivable successfully', async () => {
    cedentFindUniqueMock.mockResolvedValue(cedent);
    receivableTypeFindUniqueMock.mockResolvedValue(receivableType);
    currencyFindUniqueMock.mockResolvedValue(currency);
    receivableCreateMock.mockResolvedValue(receivable);

    const result = await service.create({
      cedentId: cedent.id,
      receivableTypeCode: 'DUPLICATA_MERCANTIL',
      currencyCode: 'BRL',
      faceValue: '25000.00',
      dueDate: '2026-08-30',
    });

    expect(receivableCreateMock).toHaveBeenCalledWith({
      data: {
        cedentId: cedent.id,
        typeId: receivableType.id,
        currencyId: currency.id,
        faceValue: '25000.000000',
        dueDate: new Date('2026-08-30'),
      },
      include: {
        cedent: true,
        type: true,
        currency: true,
      },
    });

    expect(result).toEqual({
      id: receivable.id,
      cedentName: 'Cedente Demonstração LTDA',
      receivableType: 'DUPLICATA_MERCANTIL',
      currencyCode: 'BRL',
      faceValue: '25000.00',
      dueDate: '2026-08-30',
      status: 'REGISTERED',
      version: 1,
      createdAt: '2026-06-28T22:00:00.000Z',
    });
  });

  it('should reject when cedent does not exist', async () => {
    cedentFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.create({
        cedentId: cedent.id,
        receivableTypeCode: 'DUPLICATA_MERCANTIL',
        currencyCode: 'BRL',
        faceValue: '25000.00',
        dueDate: '2026-08-30',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should reject when receivable type does not exist', async () => {
    cedentFindUniqueMock.mockResolvedValue(cedent);
    receivableTypeFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.create({
        cedentId: cedent.id,
        receivableTypeCode: 'UNKNOWN_TYPE',
        currencyCode: 'BRL',
        faceValue: '25000.00',
        dueDate: '2026-08-30',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject when currency does not exist', async () => {
    cedentFindUniqueMock.mockResolvedValue(cedent);
    receivableTypeFindUniqueMock.mockResolvedValue(receivableType);
    currencyFindUniqueMock.mockResolvedValue(null);

    await expect(
      service.create({
        cedentId: cedent.id,
        receivableTypeCode: 'DUPLICATA_MERCANTIL',
        currencyCode: 'EUR',
        faceValue: '25000.00',
        dueDate: '2026-08-30',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject faceValue less than or equal to zero', async () => {
    cedentFindUniqueMock.mockResolvedValue(cedent);
    receivableTypeFindUniqueMock.mockResolvedValue(receivableType);
    currencyFindUniqueMock.mockResolvedValue(currency);

    await expect(
      service.create({
        cedentId: cedent.id,
        receivableTypeCode: 'DUPLICATA_MERCANTIL',
        currencyCode: 'BRL',
        faceValue: '0',
        dueDate: '2026-08-30',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should list receivables', async () => {
    receivableFindManyMock.mockResolvedValue([receivable]);

    const result = await service.findAll();

    expect(receivableFindManyMock).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        cedent: true,
        type: true,
        currency: true,
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(receivable.id);
    expect(result[0].status).toBe('REGISTERED');
  });

  it('should find receivable by id', async () => {
    receivableFindUniqueMock.mockResolvedValue(receivable);

    const result = await service.findById(receivable.id);

    expect(receivableFindUniqueMock).toHaveBeenCalledWith({
      where: {
        id: receivable.id,
      },
      include: {
        cedent: true,
        type: true,
        currency: true,
      },
    });

    expect(result.id).toBe(receivable.id);
    expect(result.faceValue).toBe('25000.00');
  });

  it('should reject when receivable is not found by id', async () => {
    receivableFindUniqueMock.mockResolvedValue(null);

    await expect(service.findById(receivable.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
