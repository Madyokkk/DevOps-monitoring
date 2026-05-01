import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.kz' })
  @IsEmail({}, { message: 'Электрондық пошта форматы қате' })
  @IsNotEmpty({ message: 'Электрондық пошта толтырылуы керек' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty({ message: 'Құпия сөз толтырылуы керек' })
  @MinLength(6, { message: 'Құпия сөз кемінде 6 таңбадан тұруы керек' })
  password: string;
}
