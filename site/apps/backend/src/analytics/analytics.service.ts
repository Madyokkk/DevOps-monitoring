import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOrdersByPeriod(period: 'day' | 'week' | 'month') {
    const now = new Date();
    let start: Date;
    if (period === 'day') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      start = d;
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start },
        status: { not: OrderStatus.CANCELLED },
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        status: true,
      },
    });

    const byDate = new Map<string, { count: number; revenue: number }>();
    for (const o of orders) {
      const key = o.createdAt.toISOString().split('T')[0];
      const curr = byDate.get(key) || { count: 0, revenue: 0 };
      curr.count++;
      curr.revenue += o.totalAmount;
      byDate.set(key, curr);
    }

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
      avgOrder: orders.length ? Math.round(orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length) : 0,
      byDate: Array.from(byDate.entries()).map(([date, v]) => ({ date, ...v })),
    };
  }

  async getTopProducts(limit = 10) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: true,
    });
    items.sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0));
    const productIds = items.slice(0, limit).map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        nameKz: true,
        variants: { select: { price: true }, orderBy: { price: 'asc' }, take: 1 },
      },
    });
    const map = new Map(products.map((p) => [p.id, p]));
    return items.slice(0, limit).map((i) => {
      const p = map.get(i.productId);
      const priceFrom = p?.variants?.[0]?.price;
      return {
        product: p ? { ...p, price: priceFrom } : null,
        quantity: i._sum.quantity ?? 0,
        orderCount: i._count,
      };
    });
  }

  async getOrdersByCity() {
    const data = await this.prisma.order.groupBy({
      by: ['cityId'],
      _count: true,
      _sum: { totalAmount: true },
      where: { status: { not: OrderStatus.CANCELLED } },
    });
    const cityIds = data.map((d) => d.cityId);
    const cities = await this.prisma.deliveryCity.findMany({
      where: { id: { in: cityIds } },
    });
    const cityMap = new Map(cities.map((c) => [c.id, c]));
    return data.map((d) => ({
      city: cityMap.get(d.cityId),
      count: d._count,
      revenue: d._sum.totalAmount ?? 0,
    }));
  }

  async getOrdersByStatus() {
    return this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });
  }

  async getUserRegistrations(period: 'day' | 'week' | 'month') {
    const now = new Date();
    let start: Date;
    if (period === 'day') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      start = d;
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    });
    const byDate = new Map<string, number>();
    for (const u of users) {
      const key = u.createdAt.toISOString().split('T')[0];
      byDate.set(key, (byDate.get(key) || 0) + 1);
    }
    return {
      total: users.length,
      byDate: Array.from(byDate.entries()).map(([date, count]) => ({ date, count })),
    };
  }

  async getFullReport(period: 'day' | 'week' | 'month') {
    const [ordersByPeriod, topProducts, byCity, byStatus, userReg] =
      await Promise.all([
        this.getOrdersByPeriod(period),
        this.getTopProducts(10),
        this.getOrdersByCity(),
        this.getOrdersByStatus(),
        this.getUserRegistrations(period),
      ]);
    return {
      orders: ordersByPeriod,
      topProducts,
      byCity,
      byStatus,
      userRegistrations: userReg,
    };
  }
}
