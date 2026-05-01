import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async getCities() {
    return this.prisma.deliveryCity.findMany({
      orderBy: { nameKz: 'asc' },
    });
  }

  async getCityById(id: string) {
    return this.prisma.deliveryCity.findUnique({
      where: { id },
    });
  }
}
