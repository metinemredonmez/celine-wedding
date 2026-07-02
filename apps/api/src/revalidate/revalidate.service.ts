import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Best-effort cache-invalidation webhook to the Next.js site. After an admin
 * write we POST the affected tags to REVALIDATE_WEBHOOK_URL; the site then runs
 * `revalidateTag`. Failures are swallowed — a down webhook must never fail the
 * admin request (ISR `revalidate` is the safety net).
 */
@Injectable()
export class RevalidateService {
  private readonly logger = new Logger(RevalidateService.name);

  constructor(private readonly config: ConfigService) {}

  async revalidate(tags: string[]): Promise<void> {
    if (tags.length === 0) {
      return;
    }

    const url = this.config.get<string>('REVALIDATE_WEBHOOK_URL');
    const secret = this.config.get<string>('REVALIDATE_SECRET');
    if (!url || !secret) {
      this.logger.debug('Revalidate webhook not configured — skipping.');
      return;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ tags }),
      });
      if (!res.ok) {
        this.logger.warn(`Revalidate webhook responded ${res.status} for tags [${tags.join(', ')}]`);
      }
    } catch (err) {
      this.logger.warn(
        `Revalidate webhook failed for tags [${tags.join(', ')}]: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
