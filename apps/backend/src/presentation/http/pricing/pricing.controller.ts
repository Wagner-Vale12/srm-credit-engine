import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
      'Calculates present value, discount amount and effective monthly rate using the Pricing Engine strategy.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pricing simulation calculated successfully.',
  })
  simulate(@Body() dto: SimulatePricingDto) {
    return this.pricingService.simulate(dto);
  }
}
