import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Role } from '@prisma/client';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsService } from './admin-products.service';
import { AdminService } from './admin.service';
import { AdminTagsService } from './admin-tags.service';
import { AdminUsersService } from './admin-users.service';
import { AuditService } from './audit.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('api/admin')
export class AdminController {
  constructor(
    private admin: AdminService,
    private adminProducts: AdminProductsService,
    private adminOrders: AdminOrdersService,
    private adminUsers: AdminUsersService,
    private adminCategories: AdminCategoriesService,
    private adminTags: AdminTagsService,
    private audit: AuditService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Басқару тақтасы' })
  getDashboard() {
    return this.admin.getDashboard();
  }

  @Get('products')
  @ApiOperation({ summary: 'Өнімдер тізімі' })
  getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminProducts.findAll(
      parseInt(page || '1'),
      parseInt(limit || '20'),
      search,
    );
  }

  @Post('products')
  @ApiOperation({ summary: 'Өнім қосу' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.adminProducts.create(dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Өнімді өзгерту' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminProducts.update(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Өнімді жою' })
  deleteProduct(@Param('id') id: string) {
    return this.adminProducts.delete(id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Тапсырыстар тізімі' })
  getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminOrders.findAll(
      parseInt(page || '1'),
      parseInt(limit || '20'),
      status as any,
      search,
    );
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Тапсырыс мәліметі' })
  getOrderById(@Param('id') id: string) {
    return this.adminOrders.getById(id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Тапсырыс статусын өзгерту' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.adminOrders.updateStatus(id, dto, user.id, user.email);
  }

  @Get('users')
  @ApiOperation({ summary: 'Қолданушылар тізімі' })
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminUsers.findAll(
      parseInt(page || '1'),
      parseInt(limit || '20'),
      search,
    );
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Қолданушыны өзгерту' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminUsers.update(id, dto);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Категория қосу' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminCategories.create(dto);
  }

  @Post('tags')
  @ApiOperation({ summary: 'Тег қосу' })
  createTag(@Body() dto: CreateTagDto) {
    return this.adminTags.create(dto);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Audit log' })
  getAuditLog(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.audit.getLogs(
      parseInt(page || '1'),
      parseInt(limit || '50'),
    );
  }
}
