import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/api";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Atölye",
  description:
    "Celine Gelinlik atölyesi — Seda Dönmez Couture. El emeği, zanaat ve ölçüye özel dikimle her gelinin hikâyesini kumaşa işliyoruz.",
};

// about metni paragraflara bölünür; yoksa zarif bir varsayılan kullanılır.
const DEFAULT_ABOUT = [
  "Celine Gelinlik, Seda Dönmez'in yılların birikimini couture bir anlayışla buluşturduğu bir atölyedir. Burada gelinlik bir üründen çok; sabırla, sevgiyle ve elle örülen bir hikâyedir.",
  "Her gelinliğin kalıbı sıfırdan, o geline özel çıkarılır. Kumaş seçimi, dantelin dokunuşu, her boncuğun yeri tek tek düşünülür. Makinenin hızına değil, elin sabrına güveniriz.",
  "Amacımız yalnızca güzel bir elbise dikmek değil; sizi en çok kendiniz gibi hissettiren, düğün gününüzün her karesinde yanınızda duran bir eser yaratmaktır.",
];

function toParagraphs(about?: string | null): string[] {
  if (!about) return DEFAULT_ABOUT;
  const parts = about
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : DEFAULT_ABOUT;
}

const CRAFT = [
  {
    title: "El emeği",
    text: "Dantel aplikeler, boncuk ve pul işlemeler tek tek elle işlenir. Sabır isteyen her detay, gelinliğinize ruh katar.",
  },
  {
    title: "Ölçüye özel kalıp",
    text: "Hazır beden yoktur. Kalıbınız yalnızca sizin ölçülerinize göre çıkarılır; provalarla milimetrik olarak size uyarlanır.",
  },
  {
    title: "Seçkin kumaşlar",
    text: "İpek, tül, kristal organze ve el işi dantel gibi özenle seçilmiş kumaşlarla çalışır; dokunuşun ve düşüşün hakkını veririz.",
  },
];

export default async function AtolyePage() {
  const settings = await getSiteSettings();
  const paragraphs = toParagraphs(settings.about);

  return (
    <>
      {/* Hikâyemiz — split kalıbı (sol foto + sağ serif başlık + metin) */}
      <section className="bg-cream">
        <div className="grid lg:grid-cols-2">
          <Reveal className="lg:sticky lg:top-0 lg:h-screen">
            <Media
              ratio="none"
              position="center"
              className="h-72 w-full sm:h-96 lg:h-full"
            />
          </Reveal>

          <div className="flex items-center px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
            <Reveal className="flex max-w-xl flex-col gap-6">
              <span className="u-label text-rose">Hikâyemiz</span>
              <h1 className="font-display text-4xl text-ink sm:text-5xl md:text-6xl">
                Zanaatın sabrı, elin dokunuşu
              </h1>
              {paragraphs.map((p, i) => (
                <p key={i} className="text-muted leading-relaxed">
                  {p}
                </p>
              ))}
              {settings.address ? (
                <p className="u-label mt-2 text-faint">{settings.address}</p>
              ) : null}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Zanaat vurguları */}
      <section className="bg-powder py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Atölyede"
              title="Her dikişte özen"
              subtitle="Couture, acele etmeden ve hakkını vererek çalışmaktır. Atölyemizde her gelinlik bu anlayışla hayat bulur."
            />
          </Reveal>

          <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {CRAFT.map((c, i) => (
              <Reveal
                key={c.title}
                delay={i * 0.08}
                className="flex flex-col gap-3 border-t border-rose-soft pt-6"
              >
                <h3 className="font-display text-2xl text-ink">{c.title}</h3>
                <p className="text-muted leading-relaxed">{c.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand
        tone="cream"
        eyebrow="Ziyaret"
        title="Atölyemizde tanışalım"
        text="Kumaşlara dokunmak, tasarımları görmek ve hikâyenizi paylaşmak için sizi atölyemize bekliyoruz. Birebir görüşme için randevu oluşturun."
        whatsappText="Merhaba, atölyenizi ziyaret etmek için randevu almak istiyorum."
        settings={settings}
      />
    </>
  );
}
