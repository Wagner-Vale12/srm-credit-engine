import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Check API health status',
    description:
      'Returns the current runtime status of the SRM Credit Engine API.',
  })
  @ApiOkResponse({
    description: 'API is running successfully.',
    schema: {
      example: {
        status: 'ok',
        service: 'srm-credit-engine-api',
        timestamp: '2026-06-29T00:00:00.000Z',
        uptime: 120.52,
      },
    },
  })
  check() {
    return {
      status: 'ok',
      service: 'srm-credit-engine-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
