import type { Metadata } from "next";
import { getContent } from "@/lib/api";
import { c } from "@/lib/content";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Media } from "@/components/site/Media";
import { CtaBand } from "@/components/site/CtaBand";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Gerçek Gelinler",
  description:
    "Celine Gelinlik'in gerçek gelinleri ve düğün günü hikâyeleri. Yakında paylaşacağımız kareler ve anılarla dolu bir galeri.",
};

type BrideStory = {
  name: string;
  detail: string;
  quote: string;
  /** portre / kare karışımı için oran */
  ratio: "portrait" | "square" | "landscape";
  /** gerçek stüdyo/atölye karesi */
  photo: string;
};

// Gerçek atölye/prova kareleri. Gelinlerin gerçek düğün fotoğrafları
// geldikçe admin'den güncellenecek; şimdilik gerçek gelinlik çekimleri.
const STORIES: BrideStory[] = [
  {
    name: "Elif & Kaan",
    detail: "İstanbul · İpek ve dantel",
    quote:
      "İlk provada aynada kendimi gördüğümde ağladım. Hayal ettiğimden çok daha fazlasıydı.",
    ratio: "portrait",
    photo: "/gelinlikler/m06-1.jpg",
  },
  {
    name: "Zeynep & Arda",
    detail: "Bodrum · Kır düğünü",
    quote:
      "Her detayı benimle birlikte düşündüler. Elbisem gerçekten bana aitmiş gibi hissettim.",
    ratio: "square",
    photo: "/gelinlikler/m03-1.jpg",
  },
  {
    name: "Merve & Can",
    detail: "İzmir · Sade zarafet",
    quote:
      "Sadelik istedim ama sıradan olmasın dedim. Tam da anlattığım o dengeyi yakaladılar.",
    ratio: "portrait",
    photo: "/gelinlikler/m02-1.jpg",
  },
  {
    name: "Deniz & Emir",
    detail: "İstanbul · El işi işleme",
    quote:
      "Boncukların tek tek elle işlendiğini bilmek elbiseme bambaşka bir anlam kattı.",
    ratio: "square",
    photo: "/gelinlikler/m08-1.jpg",
  },
  {
    name: "Selin & Ege",
    detail: "Ankara · Uzun kuyruk",
    quote:
      "Şehir dışındaydım, çoğu görüşmeyi video ile yaptık. Yine de her an yanımdaydılar.",
    ratio: "portrait",
    photo: "/gelinlikler/m07-1.jpg",
  },
  {
    name: "Ayşe & Mert",
    detail: "İstanbul · Klasik siluet",
    quote:
      "Annemin de beğeneceği, zamansız bir gelinlik istedim. İkimizi de mutlu etti.",
    ratio: "square",
    photo: "/gelinlikler/m04-1.jpg",
  },
];

export default async function GercekGelinlerPage() {
  const content = await getContent();

  return (
    <>
      {/* Giriş */}
      <section className="bg-powder pt-20 pb-12 sm:pt-28 sm:pb-16">
        <Container>
          <Reveal>
            <SectionHeading
              size="lg"
              eyebrow={c(content, "gercek.eyebrow")}
              title={c(content, "gercek.title")}
              subtitle={c(content, "gercek.subtitle")}
            />
          </Reveal>
        </Container>
      </section>

      {/* Editoryal grid */}
      <section className="bg-powder pb-20 sm:pb-28">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((b, i) => (
              <Reveal
                key={b.name}
                delay={(i % 3) * 0.08}
                className="flex flex-col gap-5"
              >
                <figure className="flex flex-col gap-5">
                  <Media
                    src={b.photo}
                    alt={`${b.name} — Celine gelinliği`}
                    ratio={b.ratio}
                    position="center"
                  />
                  <figcaption className="flex flex-col gap-3">
                    <p className="font-display text-lg leading-snug text-ink">
                      &ldquo;{b.quote}&rdquo;
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="u-label text-rose">{b.name}</span>
                      <span className="text-sm text-faint">{b.detail}</span>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          {/* Yakında notu */}
          <Reveal delay={0.1}>
            <div className="mt-16 border-t border-rose-soft pt-10 text-center">
              <p className="u-label text-faint">
                {c(content, "gercek.soonLabel")}
              </p>
              <p className="mx-auto mt-4 max-w-xl text-muted leading-relaxed">
                {c(content, "gercek.soonText")}
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <CtaBand tone="cream" />
    </>
  );
}
