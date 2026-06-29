import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListSettlementsQueryDto } from './dto/list-settlements-query.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('Reports')
@Controller('settlement-reports')
export class SettlementReportsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get()
  @ApiOperation({
    summary: 'List the analytical settlement report',
    description:
      'Returns settlement rows with server-side pagination and optional cedent, currency, receivable type and settlement date filters.',
  })
  @ApiOkResponse({ description: 'Paginated analytical report.' })
  findAll(@Query() query: ListSettlementsQueryDto) {
    return this.settlementsService.findAll(query);
  }
}
