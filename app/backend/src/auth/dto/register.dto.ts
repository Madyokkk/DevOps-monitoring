import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.kz' })
  @IsEmail({}, { message: 'Электрондық пошта форматы қате' })
  @IsNotEmpty({ message: 'Электрондық пошта толтырылуы керек' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty({ message: 'Құпия сөз толтырылуы керек' })
  @MinLength(8, { message: 'Құпия сөз кемінде 8 таңбадан тұруы керек' })
  password: string;

  @ApiProperty({ example: 'Айбек Қасымов' })
  @IsNotEmpty({ message: 'Аты-жөні толтырылуы керек' })
  fullName: string;

  @ApiProperty({ example: '+7 701 123 45 67', required: false })
  @IsOptional()
  @Matches(/^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, {
    message: 'Телефон форматы: +7 7XX XXX XX XX',
  })
  phone?: string;
}
