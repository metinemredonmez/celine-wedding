import type { Metadata } from 'next';
import Container from '@/components/site/Container';
import SectionHeading from '@/components/site/SectionHeading';
import { getSiteSettings } from '@/lib/api';
import { getLocale } from '@/lib/i18n';
import { t } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description:
    'Celine Gelinlik — 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
};

export default async function KvkkPage() {
  const [settings, locale] = await Promise.all([getSiteSettings(), getLocale()]);
  const phone = settings?.phone?.trim() || '';
  const address =
    settings?.address?.trim() || t(locale, 'kvkk.s1.defaultAddress');

  // 1. bölüm gövdesi: {address} + {phone} yer tutucuları.
  const phoneSuffix = phone
    ? t(locale, 'kvkk.s1.phone').replace('{phone}', phone)
    : '';
  const s1Body = t(locale, 'kvkk.s1.body')
    .replace('{address}', address)
    .replace('{phone}', phoneSuffix);

  const sections = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    n,
    title: t(locale, `kvkk.s${n}.title`),
    body: n === 1 ? s1Body : t(locale, `kvkk.s${n}.body`),
  }));

  return (
    <div className="bg-powder">
      <Container size="narrow" className="py-20 md:py-28">
        <SectionHeading
          eyebrow={t(locale, 'kvkk.eyebrow')}
          title={t(locale, 'kvkk.title')}
          align="left"
        />

        <div className="mt-10 space-y-7 text-[15px] leading-[1.85] text-ink/80">
          <p>{t(locale, 'kvkk.intro')}</p>

          {sections.map((s) => (
            <section key={s.n}>
              <h2 className="font-display text-2xl text-ink">{s.title}</h2>
              <p className="mt-3">{s.body}</p>
            </section>
          ))}

          <p className="pt-4 text-[13px] text-muted">
            {t(locale, 'kvkk.disclaimer')}
          </p>
        </div>
      </Container>
    </div>
  );
}
