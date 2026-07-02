import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Appointment } from '@prisma/client';
import { createTransport, type Transporter } from 'nodemailer';

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};
const esc = (s: string | null | undefined): string =>
  (s ?? '—').replace(/[&<>"]/g, (c) => ENTITIES[c]);

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }
    const host = this.config.get<string>('SMTP_HOST');
    if (!host) {
      this.logger.debug('SMTP not configured — e-posta bildirimleri devre dışı.');
      return null;
    }
    const port = Number(this.config.get('SMTP_PORT', 587));
    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
      // Ulaşılamayan SMTP, çağıranı dakikalarca asmasın.
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 15_000,
    });
    return this.transporter;
  }

  /** Best-effort: notify the owner + confirm to the customer. Never throws. */
  async sendAppointmentNotifications(appt: Appointment): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      return;
    }

    const from = this.config.get<string>(
      'SMTP_FROM',
      'Celine Gelinlik <no-reply@celinegelinlik.com>',
    );
    const owner = this.config.get<string>('OWNER_EMAIL');
    const dateStr = appt.preferredDate
      ? new Date(appt.preferredDate).toLocaleDateString('tr-TR')
      : '—';

    try {
      if (owner) {
        await transporter.sendMail({
          from,
          to: owner,
          subject: `Yeni randevu talebi — ${esc(appt.name)}`,
          html: `<h2 style="font-family:Georgia,serif">Yeni randevu talebi</h2>
<p><b>Ad Soyad:</b> ${esc(appt.name)}<br/>
<b>Telefon:</b> ${esc(appt.phone)}<br/>
<b>E-posta:</b> ${esc(appt.email)}<br/>
<b>Tercih edilen tarih:</b> ${esc(dateStr)}<br/>
<b>Mesaj:</b> ${esc(appt.message)}</p>`,
        });
      }

      if (appt.email) {
        await transporter.sendMail({
          from,
          to: appt.email,
          subject: 'Randevu talebiniz alındı — Celine Gelinlik',
          html: `<p>Sevgili ${esc(appt.name)},</p>
<p>Randevu talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.</p>
<p style="color:#8a7c6a">Celine Gelinlik · Maltepe, İstanbul</p>`,
        });
      }
    } catch (err) {
      this.logger.warn(
        `Randevu e-postası gönderilemedi: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
