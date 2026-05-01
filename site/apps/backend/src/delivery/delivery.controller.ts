import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';

@ApiTags('delivery')
@Controller('api/delivery')
export class DeliveryController {
  constructor(private delivery: DeliveryService) {}

  @Get('cities')
  @ApiOperation({ summary: 'Жеткізу қалалары (Қазақстан)' })
  getCities() {
    return this.delivery.getCities();
  }

  @Get('cities/:id')
  @ApiOperation({ summary: 'Қала бойынша' })
  getCityById(@Param('id') id: string) {
    return this.delivery.getCityById(id);
  }
}
