import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('api/products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Өнімдер тізімі (сүзгі, пагинация)' })
  findAll(@Query() query: ProductQueryDto) {
    return this.products.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Хит өнімдер' })
  getFeatured() {
    return this.products.getFeatured(8);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Өнім мәліметі' })
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }
}
