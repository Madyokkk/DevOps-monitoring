import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class AdminTagsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    return this.prisma.tag.create({ data: dto });
  }
}
