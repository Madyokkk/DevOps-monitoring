import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AssistantRequestDto } from './dto/assistant-request.dto';

@ApiTags('ai')
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('assistant')
  @ApiOperation({ summary: 'N8N арқылы AI ассистентке сұрау жіберу' })
  async askAssistant(@Body() dto: AssistantRequestDto) {
    return this.aiService.askAssistant(dto.message, dto.userId);
  }
}
