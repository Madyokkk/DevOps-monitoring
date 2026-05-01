import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Толық есеп (күн/апта/ай)' })
  getFullReport(@Query('period') period?: 'day' | 'week' | 'month') {
    return this.analytics.getFullReport(period || 'month');
  }

  @Get('orders-by-period')
  @ApiOperation({ summary: 'Тапсырыстар кезең бойынша' })
  getOrdersByPeriod(@Query('period') period?: 'day' | 'week' | 'month') {
    return this.analytics.getOrdersByPeriod(period || 'month');
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Үздік өнімдер' })
  getTopProducts() {
    return this.analytics.getTopProducts(10);
  }

  @Get('orders-by-city')
  @ApiOperation({ summary: 'Қала бойынша жеткізу' })
  getOrdersByCity() {
    return this.analytics.getOrdersByCity();
  }
}
