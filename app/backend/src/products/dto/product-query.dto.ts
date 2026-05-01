import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Категория slug' })
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Тег slug (бірнеше үтіруге болады)' })
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({ description: 'Түс slug' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Баға мин (KZT)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Баға макс (KZT)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Сұрыптау: price_asc, price_desc, name' })
  @IsOptional()
  sort?: 'price_asc' | 'price_desc' | 'name';

  @ApiPropertyOptional({ description: 'Іздеу сөзі' })
  @IsOptional()
  search?: string;
}
