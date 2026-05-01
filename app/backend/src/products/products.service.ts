import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 12,
      category,
      tag,
      color,
      minPrice,
      maxPrice,
      sort = 'price_asc',
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };
    if (category) {
      where.category = { slug: category };
    }
    if (tag) {
      where.tags = {
        some: { tag: { slug: tag } },
      };
    }
    const variantFilter: Prisma.ProductVariantWhereInput = {};
    if (color) variantFilter.color = { slug: color };
    if (minPrice != null || maxPrice != null) {
      variantFilter.price = {};
      if (minPrice != null) variantFilter.price.gte = minPrice;
      if (maxPrice != null) variantFilter.price.lte = maxPrice;
    }
    if (Object.keys(variantFilter).length > 0) {
      where.variants = { some: variantFilter };
    }
    if (search) {
      where.OR = [
        { nameKz: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [raw, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: { select: { nameKz: true, slug: true } },
          tags: { include: { tag: { select: { nameKz: true, slug: true } } } },
          variants: {
            select: { price: true, imageUrl: true, stock: true },
            orderBy: { price: 'asc' },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const data = raw.map((p) => {
      const minVariant = p.variants[0];
      const priceFrom = minVariant?.price ?? 0;
      const imageUrl = minVariant?.imageUrl ?? p.imageUrl ?? undefined;
      const inStock = p.variants.some((v) => v.stock > 0);
      return {
        ...p,
        price: priceFrom,
        priceFrom,
        imageUrl,
        inStock,
      };
    });

    if (sort === 'price_asc' || sort === 'price_desc') {
      data.sort((a, b) => (sort === 'price_asc' ? a.priceFrom - b.priceFrom : b.priceFrom - a.priceFrom));
    }

    return { data, total, page, limit };
  }

  async findBySlug(slug: string) {
    const p = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: { select: { nameKz: true, slug: true } },
        tags: { include: { tag: { select: { nameKz: true, slug: true } } } },
        variants: {
          include: { color: { select: { nameKz: true, slug: true, hex: true } } },
          orderBy: { price: 'asc' },
        },
      },
    });
    if (!p) return null;
    const priceFrom = p.variants[0]?.price;
    const inStock = p.variants.some((v) => v.stock > 0);
    return { ...p, priceFrom, inStock };
  }

  async getFeatured(limit = 8) {
    const raw = await this.prisma.product.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { nameKz: true, slug: true } },
        variants: {
          select: { price: true, imageUrl: true },
          orderBy: { price: 'asc' },
        },
      },
    });
    return raw.map((p) => {
      const v = p.variants[0];
      return {
        ...p,
        price: v?.price ?? 0,
        imageUrl: v?.imageUrl ?? p.imageUrl ?? undefined,
      };
    });
  }
}
