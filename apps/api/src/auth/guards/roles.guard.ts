import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AdminRole } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import type { AuthUser } from '../auth.types';

/**
 * Optional role check. Must run after `JwtAuthGuard` so `request.user` exists.
 * No `@Roles()` metadata → allow (guard is a no-op for that route).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminRole[] | undefined>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user;

    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
