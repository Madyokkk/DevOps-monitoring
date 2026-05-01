import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AssistantRequestDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  userId?: string;
}
