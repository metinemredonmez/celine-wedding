import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AdminUser } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser, JwtPayload, TokenPair } from './auth.types';
import { LoginDto } from './dto/login.dto';

// OWASP 2024+ argon2id parameters — mirrors prisma/seed.ts.
const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Verify credentials with argon2. Returns the admin or null (no enumeration). */
  async validateAdmin(email: string, password: string): Promise<AdminUser | null> {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      return null;
    }
    const valid = await argon2.verify(admin.passwordHash, password);
    return valid ? admin : null;
  }

  /** Issue access + refresh tokens for valid credentials. */
  async login(dto: LoginDto): Promise<TokenPair> {
    const admin = await this.validateAdmin(dto.email, dto.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(admin.id, admin.email, admin.role);
  }

  /**
   * Rotation: verify the presented refresh token against JWT_REFRESH_SECRET and
   * the stored hash, then issue a fresh pair (and store the new refresh hash).
   */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new ForbiddenException('Access denied');
    }

    const admin = await this.prisma.adminUser.findUnique({ where: { id: payload.sub } });
    if (!admin?.refreshTokenHash) {
      throw new ForbiddenException('Access denied');
    }

    const matches = await argon2.verify(admin.refreshTokenHash, refreshToken);
    if (!matches) {
      throw new ForbiddenException('Access denied');
    }

    return this.issueTokens(admin.id, admin.email, admin.role);
  }

  /** Invalidate the stored refresh hash — logout / global sign-out. */
  async logout(userId: string): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  /** Current admin profile for `GET /auth/me`. */
  async me(userId: string): Promise<AuthUser> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid token');
    }
    return admin;
  }

  private async issueTokens(
    sub: string,
    email: string,
    role: AuthUser['role'],
  ): Promise<TokenPair> {
    const payload: JwtPayload = { sub, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m') as unknown as number,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d') as unknown as number,
      }),
    ]);

    await this.prisma.adminUser.update({
      where: { id: sub },
      data: {
        refreshTokenHash: await argon2.hash(refreshToken, ARGON2_OPTS),
        lastLoginAt: new Date(),
      },
    });

    return { accessToken, refreshToken };
  }
}
