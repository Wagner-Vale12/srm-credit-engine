/// <reference types="jest" />

import { BadRequestException, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { ReceivablesService } from './receivables.service';

describe('ReceivablesService', () => {
  let service: ReceivablesService;

  const cedentFindUniqueMock = jest.fn();
  const receivableTypeFindUniqueMock = jest.fn();
  const currencyFindUniqueMock = jest.fn();
  const receivableCreateMock = jest.fn();
  const receivableFindUniqueMock = jest.fn();

  const prismaMock = {
    cedent: {
      findUnique: jest.fn(),
    },
    receivableType: {
      findUnique: jest.fn(),
    },
    currency: {
      findUnique: jest.fn(),
    },
    receivable: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.cedent.findUnique = cedentFindUniqueMock;
    prismaMock.receivableType.findUnique = receivableTypeFindUniqueMock;
    prismaMock.currency.findUnique = currencyFindUniqueMock;
    prismaMock.receivable.create = receivableCreateMock;
    prismaMock.receivable.findUnique = receivableFindUniqueMock;

    prismaMock.$transaction.mockImplementation(async (operations) => {
      return Promise.all(operations);
    });

    service = new ReceivablesService(prismaMock as any);
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
    const receivable = {
      id: 'receivable-id',
      faceValue: '10000.000000',
      dueDate: new Date('2026-07-30'),
      status: 'REGISTERED',
      version: 1,
      createdAt: new Date('2026-06-29T00:00:00.000Z'),
      cedent: {
        name: 'Cedente Demonstração LTDA',
      },
      type: {
        code: 'DUPLICATA_MERCANTIL',
      },
      currency: {
        code: 'BRL',
      },
    };

    prismaMock.receivable.count.mockResolvedValue(1);
    prismaMock.receivable.findMany.mockResolvedValue([receivable]);

    const result = await service.findAll();

    expect(prismaMock.receivable.count).toHaveBeenCalledWith({
      where: {},
    });

    expect(prismaMock.receivable.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        cedent: true,
        type: true,
        currency: true,
      },
    });

    expect(result).toEqual({
      data: [
        {
          id: 'receivable-id',
          cedentName: 'Cedente Demonstração LTDA',
          receivableType: 'DUPLICATA_MERCANTIL',
          currencyCode: 'BRL',
          faceValue: '10000.00',
          dueDate: '2026-07-30',
          status: 'REGISTERED',
          version: 1,
          createdAt: '2026-06-29T00:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
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
