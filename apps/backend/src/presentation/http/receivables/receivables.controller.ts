import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ReceivablesService } from '../../../application/receivables/receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { ListReceivablesQueryDto } from './dto/list-receivables-query.dto';

@ApiTags('Receivables')
@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create receivable',
    description:
      'Registers a new receivable with REGISTERED status after validating cedent, receivable type, currency, face value and due date.',
  })
  @ApiCreatedResponse({
    description: 'Receivable created successfully.',
    schema: {
      example: {
        id: '5b2094da-53fe-43a6-99e7-ed67bbfadc4f',
        cedentName: 'Cedente Demonstração LTDA',
        receivableType: 'DUPLICATA_MERCANTIL',
        currencyCode: 'BRL',
        faceValue: '10000.00',
        dueDate: '2026-07-30',
        status: 'REGISTERED',
        version: 1,
        createdAt: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload or business validation error.',
    schema: {
      example: {
        statusCode: 400,
        error: 'Bad Request',
        // eslint-disable-next-line prettier/prettier
        message: [
          'faceValue must be a positive decimal string. Example: 10000.00',
        ],
        path: '/api/v1/receivables',
        method: 'POST',
        correlationId: 'example-correlation-id',
        timestamp: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Cedent not found.',
    schema: {
      example: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Cedent not found',
        path: '/api/v1/receivables',
        method: 'POST',
        correlationId: 'example-correlation-id',
        timestamp: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  create(@Body() dto: CreateReceivableDto) {
    return this.receivablesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List receivables',
    description:
      'Returns receivables with pagination and optional filters by status, currency, type, cedent and due date.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Number of items per page. Maximum: 100.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['REGISTERED', 'PRICED', 'SETTLED', 'CANCELLED'],
    description: 'Receivable status filter.',
  })
  @ApiQuery({
    name: 'currencyCode',
    required: false,
    enum: ['BRL', 'USD'],
    description: 'Currency code filter.',
  })
  @ApiQuery({
    name: 'receivableTypeCode',
    required: false,
    enum: ['DUPLICATA_MERCANTIL', 'CHEQUE_PRE_DATADO'],
    description: 'Receivable type code filter.',
  })
  @ApiQuery({
    name: 'cedentId',
    required: false,
    example: '58b6d169-a1af-443e-b293-993c33fb8e91',
    description: 'Cedent identifier filter.',
  })
  @ApiQuery({
    name: 'dueDateFrom',
    required: false,
    example: '2026-07-01',
    description: 'Minimum due date filter.',
  })
  @ApiQuery({
    name: 'dueDateTo',
    required: false,
    example: '2026-12-31',
    description: 'Maximum due date filter.',
  })
  @ApiOkResponse({
    description: 'Receivables returned successfully.',
    schema: {
      example: {
        data: [
          {
            id: '5b2094da-53fe-43a6-99e7-ed67bbfadc4f',
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
      },
    },
  })
  findAll(@Query() query: ListReceivablesQueryDto) {
    return this.receivablesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get receivable by id',
    description: 'Returns a receivable by its identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Receivable identifier.',
    example: '5b2094da-53fe-43a6-99e7-ed67bbfadc4f',
  })
  @ApiOkResponse({
    description: 'Receivable returned successfully.',
    schema: {
      example: {
        id: '5b2094da-53fe-43a6-99e7-ed67bbfadc4f',
        cedentName: 'Cedente Demonstração LTDA',
        receivableType: 'DUPLICATA_MERCANTIL',
        currencyCode: 'BRL',
        faceValue: '10000.00',
        dueDate: '2026-07-30',
        status: 'REGISTERED',
        version: 1,
        createdAt: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Receivable not found.',
    schema: {
      example: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Receivable not found',
        path: '/api/v1/receivables/5b2094da-53fe-43a6-99e7-ed67bbfadc4f',
        method: 'GET',
        correlationId: 'example-correlation-id',
        timestamp: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  findById(@Param('id') id: string) {
    return this.receivablesService.findById(id);
  }
}
