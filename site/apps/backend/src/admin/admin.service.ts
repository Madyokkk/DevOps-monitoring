import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getDashboard() {
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      newOrdersToday,
      ordersByStatus,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.user.count(),
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);
    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      totalUsers,
      newOrdersToday,
      ordersByStatus: Object.fromEntries(
        ordersByStatus.map((o) => [o.status, o._count]),
      ),
    };
  }
}
