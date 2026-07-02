import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { CtaBand } from "@/components/site/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Özel Dikim",
  description:
    "Celine Gelinlik'te ölçüye özel couture süreci: istişare, tasarım ve eskiz, provalar, dikim ve teslim. Size özel, tek bir gelinlik.",
};

type ProcessStep = {
  step: string;
  title: string;
  duration: string;
  text: string;
};

const STEPS: ProcessStep[] = [
  {
    step: "01",
    title: "İstişare",
    duration: "İlk buluşma",
    text: "Atölyemizde birebir tanışıyoruz. Hayalinizdeki silueti, düğün konseptinizi ve size en yakışan kumaşları konuşuyor; vücut tipiniz ve tarzınız üzerine sakin bir sohbetle yolculuğun tonunu belirliyoruz.",
  },
  {
    step: "02",
    title: "Tasarım & Eskiz",
    duration: "2–4 hafta",
    text: "Sizin için özgün bir tasarım çiziyoruz. Eskizler, kumaş ve dantel numuneleri, boncuk ve işleme detayları üzerinde birlikte karar veriyoruz. Her çizgi yalnızca sizin gelinliğiniz için düşünülüyor.",
  },
  {
    step: "03",
    title: "Provalar",
    duration: "Birkaç prova",
    text: "Kalıbınız sıfırdan, ölçünüze göre çıkarılıyor. Ardışık provalarla duruş, kumaşın akışı ve her dikiş milimetrik olarak size uyarlanıyor. Bedeninizde kusursuz oturana kadar birlikte çalışıyoruz.",
  },
  {
    step: "04",
    title: "Dikim & Teslim",
    duration: "Son rötuşlar",
    text: "El emeği işlemeler, son ütü ve dikkatli bir kalite kontrolünün ardından gelinliğiniz teslime hazır. Düğün gününüzde tek ve size özel bir eserle salona adım atıyorsunuz.",
  },
];

export default function OzelDikimPage() {
  return (
    <>
      {/* Giriş */}
      <section className="bg-powder pt-20 pb-16 sm:pt-28 sm:pb-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <SectionHeading
                align="left"
                size="lg"
                eyebrow="Özel Dikim"
                title="Yalnızca size ait, ölçüye özel bir gelinlik"
                subtitle="Celine Gelinlik'te her gelinlik sıfırdan, size özel tasarlanır ve elde dikilir. Hazır bir kalıp değil; sizin hikâyenizden, siluetinizden ve kumaşınızdan doğan tek bir eser."
              />
              <div className="mt-8">
                <ButtonLink href="/randevu" variant="primary">
                  Randevu Al
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <Media ratio="portrait" position="center" />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Süreç adımları */}
      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Süreç"
              title="Dört adımda couture yolculuğu"
              subtitle="İlk sohbetten teslim gününe kadar her aşamada yanınızdayız. Acele etmeden, hakkını vererek."
            />
          </Reveal>

          <ol className="mt-16 grid gap-px overflow-hidden border-y border-rose-soft sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <Reveal
                as="li"
                key={s.step}
                delay={i * 0.08}
                className="flex flex-col gap-4 bg-cream px-6 py-10 sm:px-10 sm:py-12"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-4xl text-rose sm:text-5xl">
                    {s.step}
                  </span>
                  <span className="u-label text-faint">{s.duration}</span>
                </div>
                <h3 className="font-display text-2xl text-ink sm:text-3xl">
                  {s.title}
                </h3>
                <p className="text-muted leading-relaxed">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Zaman & şehir dışı notu */}
      <section className="bg-powder py-20 sm:py-28">
        <Container size="narrow">
          <div className="grid gap-12 sm:grid-cols-2">
            <Reveal className="flex flex-col gap-3">
              <span className="u-label text-rose">Zaman planı</span>
              <h3 className="font-display text-2xl text-ink sm:text-3xl">
                Yaklaşık 6–12 ay
              </h3>
              <p className="text-muted leading-relaxed">
                Ölçüye özel bir gelinlik zaman ister. İdeal olarak düğününüzden
                6 ila 12 ay önce sürece başlamanızı öneririz; böylece tasarım,
                provalar ve el işçiliği için gereken zaman rahatça açılır. Daha
                kısa süreler için lütfen bizimle görüşün, birlikte
                değerlendirelim.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="flex flex-col gap-3">
              <span className="u-label text-rose">Şehir dışı gelinler</span>
              <h3 className="font-display text-2xl text-ink sm:text-3xl">
                Uzaktan da yanınızdayız
              </h3>
              <p className="text-muted leading-relaxed">
                İstanbul dışında yaşıyorsanız süreci sizin için kolaylaştırıyoruz.
                İlk istişareyi ve ara görüşmeleri video ile yapabilir, provaları
                birkaç ziyarete toplayabiliriz. Randevu oluştururken şehir dışında
                olduğunuzu belirtmeniz yeterli.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand
        tone="cream"
        title="Hikâyenizi birlikte dikelim"
        text="Özel dikim yolculuğunuz bir sohbetle başlar. Atölyemizde tanışmak ve size özel gelinliğinizin ilk adımını atmak için randevu oluşturun."
        whatsappText="Merhaba, özel dikim gelinlik için randevu almak istiyorum."
      />
    </>
  );
}
