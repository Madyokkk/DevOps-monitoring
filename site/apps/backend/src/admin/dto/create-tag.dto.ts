import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nameKz: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;
}
