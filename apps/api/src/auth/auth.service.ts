import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { compare, hash } from 'bcryptjs';
import { createHash } from 'crypto';
import { UserType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(input: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new BadRequestException('Email já cadastrado');

    const passwordHash = await hash(input.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        userType: input.userType,
        specialties: []
      }
    });

    return this.issueTokenPair(user.id, user.email, user.userType);
  }

  async login(input: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    return this.issueTokenPair(user.id, user.email, user.userType);
  }

  async refresh(input: RefreshDto) {
    const payload = await this.jwtService.verifyAsync<{ sub: string; email: string; userType: string }>(
      input.refreshToken,
      { secret: this.config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret') }
    );

    const tokenHash = this.hashToken(input.refreshToken);

    const savedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!savedToken) throw new UnauthorizedException('Refresh token inválido');

    await this.prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { revokedAt: new Date() }
    });

    return this.issueTokenPair(payload.sub, payload.email, payload.userType as UserType);
  }

  private async issueTokenPair(userId: string, email: string, userType: UserType) {
    const payload = { sub: userId, email, userType };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret'),
      expiresIn: '15m'
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
      expiresIn: '7d'
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
