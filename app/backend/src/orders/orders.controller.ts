import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'Тапсырыс беру (кірмегенде де жұмыс істейді)' })
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user?: { id: string },
  ) {
    return this.orders.create(dto, user?.id);
  }

  @Get(':id')
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({ summary: 'Тапсырыс мәліметі' })
  getById(
    @Param('id') id: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.orders.getById(id, user?.id);
  }
}
