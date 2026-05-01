import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('colors')
@Controller('api/colors')
export class ColorsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.color.findMany({ orderBy: { nameKz: 'asc' } });
  }
}
