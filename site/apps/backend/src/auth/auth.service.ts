import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new UnauthorizedException('Бұл электрондық пошта тіркелген');
    }
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        fullName: dto.fullName,
        phone: dto.phone,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });
    return {
      user,
      access_token: this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Электрондық пошта немесе құпия сөз қате');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Электрондық пошта немесе құпия сөз қате');
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
      access_token: this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }

  async validateUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) return null;
    return user;
  }
}
