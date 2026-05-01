import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    adminId: string,
    adminEmail: string,
    action: string,
    entityType: string,
    entityId?: string,
    oldValue?: object,
    newValue?: object,
    orderId?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        adminId,
        adminEmail,
        action,
        entityType,
        entityId,
        oldValue: oldValue as object | null ?? undefined,
        newValue: newValue as object | null ?? undefined,
        orderId,
      },
    });
  }

  async getLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, total, page, limit };
  }
}
