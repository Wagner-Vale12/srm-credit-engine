import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('Settlements')
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create settlement',
    description:
      'Settles a receivable using ACID transaction, pricing simulation, payment item creation and audit log.',
  })
  @ApiResponse({
    status: 201,
    description: 'Settlement created successfully.',
  })
  create(@Body() dto: CreateSettlementDto) {
    return this.settlementsService.create(dto);
  }

  @Get(':id/report')
  @ApiOperation({
    summary: 'Get settlement report',
    description:
      'Returns a settlement report with receivable, pricing and payment data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Settlement identifier.',
  })
  @ApiResponse({
    status: 200,
    description: 'Settlement report returned successfully.',
  })
  getReport(@Param('id') id: string) {
    return this.settlementsService.getReport(id);
  }
}
