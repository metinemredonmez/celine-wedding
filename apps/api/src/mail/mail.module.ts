import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

// Global so any service (e.g. Appointments) can inject MailService without wiring.
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
