import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Applies the Bearer access-token strategy. Used per-endpoint on admin routes
 * via `@UseGuards(JwtAuthGuard)`; public reads remain unguarded.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
