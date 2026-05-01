import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('api/categories')
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Барлық категориялар' })
  findAll() {
    return this.categories.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Категория бойынша' })
  findBySlug(@Param('slug') slug: string) {
    return this.categories.findBySlug(slug);
  }
}
