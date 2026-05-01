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
    await this.notifyUserCreated(user);
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

  private async notifyUserCreated(user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    role: Role;
  }) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const message = [
      '👤 <b>Создан новый пользователь</b>',
      '━━━━━━━━━━━━━━━━',
      `<b>ID:</b> <code>${this.escapeHtml(user.id)}</code>`,
      `<b>Email:</b> <code>${this.escapeHtml(user.email)}</code>`,
      `<b>Имя:</b> ${this.escapeHtml(user.fullName)}`,
      `<b>Телефон:</b> ${this.escapeHtml(user.phone ?? 'не указан')}`,
      `<b>Роль:</b> <code>${user.role}</code>`,
      `<b>Время:</b> <code>${new Date().toISOString()}</code>`,
    ].join('\n');

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
    } catch (error) {
      console.error('Telegram user notification failed', error);
    }
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
