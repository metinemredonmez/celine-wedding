import type { Metadata } from 'next';
import Container from '@/components/site/Container';
import SectionHeading from '@/components/site/SectionHeading';
import { getSiteSettings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description:
    'Celine Gelinlik — 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
};

export default async function KvkkPage() {
  const settings = await getSiteSettings();
  const phone = settings?.phone?.trim() || '';
  const address =
    settings?.address?.trim() ||
    'İdealtepe Mah. Panorama Sok. Defne Apt. No:5 D:7, Maltepe / İstanbul';

  return (
    <div className="bg-powder">
      <Container size="narrow" className="py-20 md:py-28">
        <SectionHeading eyebrow="Yasal" title="KVKK Aydınlatma Metni" align="left" />

        <div className="mt-10 space-y-7 text-[15px] leading-[1.85] text-ink/80">
          <p>
            Celine Gelinlik (Seda Dönmez Couture) olarak, 6698 sayılı Kişisel Verilerin
            Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca veri sorumlusu sıfatıyla, kişisel
            verilerinizi aşağıda açıklanan kapsamda işlemekteyiz.
          </p>

          <section>
            <h2 className="font-display text-2xl text-ink">1. Veri Sorumlusu</h2>
            <p className="mt-3">
              Celine Gelinlik — Seda Dönmez Couture. Adres: {address}.
              {phone ? ` Telefon: ${phone}.` : ''}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">2. İşlenen Kişisel Veriler</h2>
            <p className="mt-3">
              Randevu ve iletişim talebiniz kapsamında; ad-soyad, telefon numarası, varsa
              e-posta adresiniz, tercih ettiğiniz randevu tarih/saati ve tarafımıza ilettiğiniz
              mesaj içeriği işlenmektedir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">3. İşleme Amaçları</h2>
            <p className="mt-3">
              Kişisel verileriniz; randevu taleplerinizin oluşturulması ve yönetilmesi, sizinle
              iletişime geçilmesi, atölye hizmetlerimizin sunulması ve talep/şikâyetlerinizin
              değerlendirilmesi amaçlarıyla işlenir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">4. Hukuki Sebep</h2>
            <p className="mt-3">
              Verileriniz, KVKK m.5 uyarınca bir sözleşmenin kurulması veya ifasıyla doğrudan
              ilgili olması, tarafımızın meşru menfaati ve gerektiğinde açık rızanız hukuki
              sebeplerine dayanılarak işlenir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">5. Aktarım</h2>
            <p className="mt-3">
              Kişisel verileriniz; yalnızca hizmetin yürütülmesi için gerekli olduğu ölçüde,
              barındırma, e-posta ve içerik dağıtımı gibi hizmet aldığımız tedarikçilerle
              (gerekli teknik ve idari tedbirler alınarak) paylaşılabilir. Verileriniz pazarlama
              amacıyla üçüncü kişilere satılmaz.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">6. Toplama Yöntemi</h2>
            <p className="mt-3">
              Verileriniz, web sitemizdeki randevu/iletişim formu ve WhatsApp/telefon üzerinden
              tarafınızca iletilen bilgiler aracılığıyla elektronik ortamda toplanır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">7. Saklama Süresi</h2>
            <p className="mt-3">
              Verileriniz, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen yasal
              saklama süreleri boyunca muhafaza edilir; sürelerin sonunda silinir, yok edilir
              veya anonim hâle getirilir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">8. Haklarınız (KVKK m.11)</h2>
            <p className="mt-3">
              Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi
              talep etme, işlenme amacını öğrenme, eksik/yanlış işlenmişse düzeltilmesini,
              şartları oluştuğunda silinmesini/yok edilmesini isteme ve işlemenin münhasıran
              otomatik sistemlerle analizi sonucu aleyhinize bir sonuç doğmasına itiraz etme
              haklarına sahipsiniz.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">9. İletişim / Başvuru</h2>
            <p className="mt-3">
              KVKK kapsamındaki taleplerinizi yukarıdaki iletişim bilgileri üzerinden bize
              iletebilirsiniz. Başvurularınız en kısa sürede ve en geç 30 gün içinde
              sonuçlandırılır.
            </p>
          </section>

          <p className="pt-4 text-[13px] text-muted">
            Bu metin bilgilendirme amaçlıdır; nihai hâli yürürlükteki mevzuata göre bir hukuk
            danışmanı tarafından gözden geçirilmelidir.
          </p>
        </div>
      </Container>
    </div>
  );
}
