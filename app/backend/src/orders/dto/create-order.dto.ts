import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiPropertyOptional({ description: 'Вариант ID — болса, баға мен қор одан алынады' })
  @IsOptional()
  @IsString()
  productVariantId?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Айбек Қасымов' })
  @IsString()
  @IsNotEmpty({ message: 'Алушы аты толтырылуы керек' })
  receiverName: string;

  @ApiProperty({ example: '+7 701 123 45 67' })
  @IsString()
  @IsNotEmpty({ message: 'Телефон толтырылуы керек' })
  @Matches(/^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, {
    message: 'Телефон форматы: +7 7XX XXX XX XX',
  })
  receiverPhone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Қала таңдаңыз' })
  cityId: string;

  @ApiProperty({ example: 'Абай даңғылы, 50, 12 пәтер' })
  @IsString()
  @IsNotEmpty({ message: 'Мекенжай толтырылуы керек' })
  address: string;

  @ApiProperty({ example: '2025-02-25T14:00:00.000Z' })
  @IsString()
  @IsNotEmpty({ message: 'Жеткізу уақытын таңдаңыз' })
  deliveryTime: string;

  @ApiPropertyOptional({ example: 'Сәлем! Сенімен болғаныма қуаныштымын!' })
  @IsOptional()
  @IsString()
  cardMessage?: string;

  @ApiProperty({ example: 'CASH', description: 'CASH | CARD_DEMO' })
  @IsString()
  @IsNotEmpty({ message: 'Төлем әдісін таңдаңыз' })
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
