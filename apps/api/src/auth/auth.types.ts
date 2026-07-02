import type { AdminRole } from '@prisma/client';

/** JWT payload signed for both access and refresh tokens. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: AdminRole;
}

/** Shape attached to `request.user` after the access-token strategy validates. */
export interface AuthUser {
  id: string;
  email: string;
  role: AdminRole;
}

/** Token pair issued on login / refresh. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
