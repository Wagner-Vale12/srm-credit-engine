import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReceivablesService } from '../../../application/receivables/receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';

@ApiTags('Receivables')
@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create receivable',
    description: 'Registers a new receivable with REGISTERED status.',
  })
  @ApiResponse({
    status: 201,
    description: 'Receivable created successfully.',
  })
  create(@Body() dto: CreateReceivableDto) {
    return this.receivablesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List receivables',
    description: 'Returns all receivables ordered by creation date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Receivables returned successfully.',
  })
  findAll() {
    return this.receivablesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get receivable by id',
    description: 'Returns a receivable by its identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Receivable identifier.',
  })
  @ApiResponse({
    status: 200,
    description: 'Receivable returned successfully.',
  })
  findById(@Param('id') id: string) {
    return this.receivablesService.findById(id);
  }
}
