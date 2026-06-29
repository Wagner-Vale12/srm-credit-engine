import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PricingService } from '../../../application/pricing/pricing.service';
import { SimulatePricingDto } from './dto/simulate-pricing.dto';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('simulate')
  @ApiOperation({
    summary: 'Simulate receivable pricing',
    description:
      'Calculates present value, discount amount and effective monthly rate using the Pricing Engine strategy selected by receivable type.',
  })
  @ApiCreatedResponse({
    description: 'Pricing simulation calculated successfully.',
    schema: {
      example: {
        faceValue: '10000.00',
        presentValue: '9636.39',
        discountAmount: '363.61',
        currencyCode: 'BRL',
        receivableType: 'DUPLICATA_MERCANTIL',
        baseRateMonthly: '1.0000',
        spreadMonthly: '1.5000',
        effectiveMonthlyRate: '2.5000',
        daysUntilDueDate: 45,
        simulationDate: '2026-06-29',
        dueDate: '2026-08-13',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid pricing simulation input.',
    schema: {
      example: {
        statusCode: 400,
        error: 'Bad Request',
        message: ['baseRateMonthly must be a decimal string. Example: 1.00'],
        path: '/api/v1/pricing/simulate',
        method: 'POST',
        correlationId: 'example-correlation-id',
        timestamp: '2026-06-29T00:00:00.000Z',
      },
    },
  })
  simulate(@Body() dto: SimulatePricingDto) {
    return this.pricingService.simulate(dto);
  }
}
