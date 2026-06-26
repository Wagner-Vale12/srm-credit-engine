import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Check API health status',
    description: 'Returns the current status of the SRM Credit Engine API.',
  })
  @ApiResponse({
    status: 200,
    description: 'API is running successfully.',
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
