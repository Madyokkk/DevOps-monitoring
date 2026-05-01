import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';

@ApiTags('tags')
@Controller('api/tags')
export class TagsController {
  constructor(private tags: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Барлық тегтер' })
  findAll() {
    return this.tags.findAll();
  }
}
