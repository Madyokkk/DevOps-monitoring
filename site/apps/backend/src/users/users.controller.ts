import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Профиль' })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.users.getProfile(user.id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Менің тапсырыстарым' })
  getMyOrders(
    @CurrentUser() user: { id: string },
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = parseInt(pageStr || '1');
    const limit = parseInt(limitStr || '10');
    return this.users.getMyOrders(user.id, page, limit);
  }
}
