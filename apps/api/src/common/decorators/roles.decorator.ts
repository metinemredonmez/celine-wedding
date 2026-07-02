import { SetMetadata } from '@nestjs/common';
import type { AdminRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to the given admin roles. With a single `ADMIN` role today
 * this is effectively a no-op, but it keeps the door open for `EDITOR` later
 * without a migration or a re-plumb of the guards.
 */
export const Roles = (...roles: AdminRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
