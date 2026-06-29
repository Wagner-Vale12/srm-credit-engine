import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  CreateReceivableInput,
  ListReceivablesInput,
  PaginatedReceivables,
  ReceivableSummary,
} from './receivables.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReceivablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateReceivableInput): Promise<ReceivableSummary> {
    const cedent = await this.prisma.cedent.findUnique({
      where: {
        id: input.cedentId,
      },
    });

    if (!cedent) {
      throw new NotFoundException('Cedent not found');
    }

    const receivableType = await this.prisma.receivableType.findUnique({
      where: {
        code: input.receivableTypeCode,
      },
    });

    if (!receivableType) {
      throw new BadRequestException(
        `Receivable type not found: ${input.receivableTypeCode}`,
      );
    }

    const currency = await this.prisma.currency.findUnique({
      where: {
        code: input.currencyCode,
      },
    });

    if (!currency) {
      throw new BadRequestException(
        `Currency not found: ${input.currencyCode}`,
      );
    }

    const faceValue = new Decimal(input.faceValue);

    if (!faceValue.isFinite() || faceValue.lte(0)) {
      throw new BadRequestException('faceValue must be greater than zero');
    }

    const dueDate = new Date(input.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException('Invalid dueDate');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate <= today) {
      throw new BadRequestException('dueDate must be greater than today');
    }

    const receivable = await this.prisma.receivable.create({
      data: {
        cedentId: cedent.id,
        typeId: receivableType.id,
        currencyId: currency.id,
        faceValue: faceValue.toDecimalPlaces(6).toFixed(6),
        dueDate,
      },
      include: {
        cedent: true,
        type: true,
        currency: true,
      },
    });

    return this.toSummary(receivable);
  }

  async findAll(
    input: ListReceivablesInput = {},
  ): Promise<PaginatedReceivables> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReceivableWhereInput = {};

    if (input.status) {
      where.status = input.status as Prisma.EnumReceivableStatusFilter;
    }

    if (input.cedentId) {
      where.cedentId = input.cedentId;
    }

    if (input.currencyCode) {
      where.currency = {
        code: input.currencyCode,
      };
    }

    if (input.receivableTypeCode) {
      where.type = {
        code: input.receivableTypeCode,
      };
    }

    if (input.dueDateFrom || input.dueDateTo) {
      where.dueDate = {
        ...(input.dueDateFrom ? { gte: new Date(input.dueDateFrom) } : {}),
        ...(input.dueDateTo ? { lte: new Date(input.dueDateTo) } : {}),
      };
    }

    const [total, receivables] = await this.prisma.$transaction([
      this.prisma.receivable.count({
        where,
      }),
      this.prisma.receivable.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          cedent: true,
          type: true,
          currency: true,
        },
      }),
    ]);

    return {
      data: receivables.map((receivable) => this.toSummary(receivable)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ReceivableSummary> {
    const receivable = await this.prisma.receivable.findUnique({
      where: {
        id,
      },
      include: {
        cedent: true,
        type: true,
        currency: true,
      },
    });

    if (!receivable) {
      throw new NotFoundException('Receivable not found');
    }

    return this.toSummary(receivable);
  }

  private toSummary(receivable: {
    id: string;
    faceValue: unknown;
    dueDate: Date;
    status: string;
    version: number;
    createdAt: Date;
    cedent: {
      name: string;
    };
    type: {
      code: string;
    };
    currency: {
      code: string;
    };
  }): ReceivableSummary {
    return {
      id: receivable.id,
      cedentName: receivable.cedent.name,
      receivableType: receivable.type.code,
      currencyCode: receivable.currency.code,
      faceValue: new Decimal(receivable.faceValue as string)
        .toDecimalPlaces(2)
        .toFixed(2),
      dueDate: receivable.dueDate.toISOString().split('T')[0],
      status: receivable.status,
      version: receivable.version,
      createdAt: receivable.createdAt.toISOString(),
    };
  }
}
