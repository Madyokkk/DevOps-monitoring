import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId?: string) {
    const city = await this.prisma.deliveryCity.findUnique({
      where: { id: dto.cityId },
    });
    if (!city) {
      throw new BadRequestException('Қала табылмады');
    }

    let subtotal = 0;
    const orderItems: { productId: string; productVariantId?: string; quantity: number; price: number }[] = [];

    for (const item of dto.items) {
      if (item.productVariantId) {
        const variant = await this.prisma.productVariant.findFirst({
          where: {
            id: item.productVariantId,
            productId: item.productId,
            product: { isActive: true },
          },
          include: { product: true },
        });
        if (!variant) throw new BadRequestException('Вариант табылмады');
        if (variant.stock < item.quantity) {
          throw new BadRequestException(`"${variant.product.nameKz}" қоймада жеткілікті емес`);
        }
        const lineTotal = variant.price * item.quantity;
        subtotal += lineTotal;
        orderItems.push({
          productId: variant.productId,
          productVariantId: variant.id,
          quantity: item.quantity,
          price: variant.price,
        });
      } else {
        const product = await this.prisma.product.findFirst({
          where: { id: item.productId, isActive: true },
          include: { variants: { orderBy: { price: 'asc' }, take: 1 } },
        });
        if (!product) throw new BadRequestException('Өнім табылмады');
        const v = product.variants[0];
        if (!v || v.stock < item.quantity) {
          throw new BadRequestException(`"${product.nameKz}" қоймада жеткілікті емес`);
        }
        const lineTotal = v.price * item.quantity;
        subtotal += lineTotal;
        orderItems.push({
          productId: product.id,
          productVariantId: v.id,
          quantity: item.quantity,
          price: v.price,
        });
      }
    }

    let deliveryFee = city.deliveryFee;
    let promoDiscount = 0;
    if (dto.promoCode) {
      const promo = await this.prisma.promoCode.findUnique({
        where: { code: dto.promoCode, isActive: true },
      });
      if (promo) {
        const minOrder = promo.minOrderAmount ?? 0;
        if (subtotal >= minOrder) {
          if (promo.discountPercent) {
            promoDiscount = Math.round((subtotal * promo.discountPercent) / 100);
          } else if (promo.discountFixed) {
            promoDiscount = promo.discountFixed;
          }
        }
      }
    }

    const totalAmount = subtotal - promoDiscount + deliveryFee;

    const order = await this.prisma.order.create({
      data: {
        userId,
        receiverName: dto.receiverName,
        receiverPhone: dto.receiverPhone,
        cityId: dto.cityId,
        address: dto.address,
        deliveryTime: new Date(dto.deliveryTime),
        cardMessage: dto.cardMessage,
        paymentMethod: dto.paymentMethod,
        subtotal,
        deliveryFee,
        totalAmount,
        promoCode: dto.promoCode ?? null,
        status: OrderStatus.NEW,
        items: {
          create: orderItems,
        },
      },
      include: {
        city: true,
        items: {
          include: {
            product: { select: { nameKz: true } },
            productVariant: { select: { price: true } },
          },
        },
      },
    });

    // decrement stock
    for (const oi of orderItems) {
      if (oi.productVariantId) {
        await this.prisma.productVariant.update({
          where: { id: oi.productVariantId },
          data: { stock: { decrement: oi.quantity } },
        });
      }
    }

    return order;
  }

  async getById(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        city: true,
        items: {
          include: {
            product: { select: { nameKz: true, imageUrl: true } },
            productVariant: { select: { price: true, imageUrl: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Тапсырыс табылмады');
    if (order.userId && userId !== order.userId) {
      throw new NotFoundException('Тапсырыс табылмады');
    }
    return order;
  }
}
