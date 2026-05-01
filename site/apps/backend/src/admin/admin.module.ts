import { Module } from '@nestjs/common';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminController } from './admin.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsService } from './admin-products.service';
import { AdminService } from './admin.service';
import { AdminTagsService } from './admin-tags.service';
import { AdminUsersService } from './admin-users.service';
import { AuditService } from './audit.service';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminProductsService,
    AdminOrdersService,
    AdminUsersService,
    AdminCategoriesService,
    AdminTagsService,
    AuditService,
  ],
  exports: [AuditService],
})
export class AdminModule {}
