import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class AdminOrdersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(page = 1, limit = 20, status?: OrderStatus, search?: string) {
    const skip = (page - 1) * limit;
    const where: { status?: OrderStatus; OR?: object[] } = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { receiverName: { contains: search, mode: 'insensitive' as const } },
        { receiverPhone: { contains: search } },
        { id: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          city: true,
          user: { select: { email: true, fullName: true } },
          items: { include: { product: { select: { nameKz: true } } } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async getById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        city: true,
        user: { select: { id: true, email: true, fullName: true, phone: true } },
        items: {
          include: {
          product: { select: { id: true, nameKz: true, imageUrl: true } },
          productVariant: { select: { imageUrl: true } },
        },
        },
      },
    });
    if (!order) throw new NotFoundException('Тапсырыс табылмады');
    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    adminId: string,
    adminEmail: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Тапсырыс табылмады');

    const oldStatus = order.status;
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        adminComment: dto.adminComment ?? order.adminComment,
      },
      include: {
        city: true,
        items: { include: { product: true } },
      },
    });

    await this.audit.log(
      adminId,
      adminEmail,
      'ORDER_STATUS_UPDATE',
      'Order',
      id,
      { status: oldStatus },
      { status: dto.status },
      id,
    );
    return updated;
  }
}
