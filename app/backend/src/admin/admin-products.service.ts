import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const { tagIds, price, stock, ...data } = dto;
    return this.prisma.product.create({
      data: {
        ...data,
        isActive: dto.isActive ?? true,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        variants: {
          create: {
            price,
            stock: stock ?? 0,
            imageUrl: data.imageUrl,
          },
        },
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        variants: true,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Өнім табылмады');

    const { tagIds, ...data } = dto;
    if (tagIds !== undefined) {
      await this.prisma.productTag.deleteMany({ where: { productId: id } });
      if (tagIds.length) {
        await this.prisma.productTag.createMany({
          data: tagIds.map((tagId) => ({ productId: id, tagId })),
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: { ...data },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async delete(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? { OR: [{ nameKz: { contains: search, mode: 'insensitive' as const } }] }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          tags: { include: { tag: true } },
          variants: { include: { color: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total, page, limit };
  }
}
