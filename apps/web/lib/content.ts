// Celine — site içeriği (metin + görsel) tek kaynaktan.
//
// Her düzenlenebilir alan burada bir kayıt: anahtar, etiket, grup, tür ve
// VARSAYILAN. Admin "İçerik" ekranı bu listeden üretilir; frontend değerleri
// `c(map, key)` ile okur. DB'de kayıt yoksa varsayılan kullanılır — yani içerik
// sistemi boşken bile site şu anki metinlerle birebir görünür (sıfır regresyon).

export type ContentType = "text" | "textarea" | "image";

export type ContentField = {
  key: string;
  label: string;
  group: string;
  type: ContentType;
  default: string;
  hint?: string;
};

export type ContentMap = Record<string, string>;

export const CONTENT_REGISTRY: ContentField[] = [
  // ── Ana Ekran (Hero) — metin ──
  { key: "hero.eyebrow", group: "Ana Ekran (Hero)", type: "text", label: "Üst etiket", default: "Seda Dönmez Couture" },
  { key: "hero.title", group: "Ana Ekran (Hero)", type: "text", label: "Başlık", default: "Size özel, tek bir gelin için." },
  { key: "hero.subtitle", group: "Ana Ekran (Hero)", type: "textarea", label: "Alt metin", default: "Ölçüye özel, kişiye özel couture gelinlik. Atölyemizde hikâyenizi dinliyor, hayalinizdeki tasarımı birlikte hayata geçiriyoruz." },
  { key: "hero.ctaPrimary", group: "Ana Ekran (Hero)", type: "text", label: "Ana buton", default: "Randevu Al" },
  { key: "hero.ctaSecondary", group: "Ana Ekran (Hero)", type: "text", label: "İkinci buton", default: "Koleksiyonu Keşfet", hint: "Hero arka plan foto/videosu Ayarlar sayfasından yönetilir." },

  // ── Ana Sayfa — Marka cümlesi ──
  { key: "home.statement", group: "Ana Sayfa — Marka Cümlesi", type: "textarea", label: "Büyük cümle", default: "Her gelinlik, tek bir gelin için tasarlanır. Kalıp yok, seri üretim yok — yalnızca size ait bir siluet, elde işlenen ince bir zarafet." },

  // ── Ana Sayfa — Öne Çıkanlar ──
  { key: "home.featured.eyebrow", group: "Ana Sayfa — Öne Çıkan Gelinlikler", type: "text", label: "Üst etiket", default: "Seçkiler" },
  { key: "home.featured.title", group: "Ana Sayfa — Öne Çıkan Gelinlikler", type: "text", label: "Başlık", default: "Öne Çıkan Gelinlikler" },
  { key: "home.featured.subtitle", group: "Ana Sayfa — Öne Çıkan Gelinlikler", type: "textarea", label: "Alt metin", default: "Koleksiyonlarımızdan özenle seçtiğimiz imza tasarımlar." },
  { key: "home.featured.cta", group: "Ana Sayfa — Öne Çıkan Gelinlikler", type: "text", label: "Buton", default: "Tüm Gelinlikler" },

  // ── Ana Sayfa — Koleksiyonlar ──
  { key: "home.collections.eyebrow", group: "Ana Sayfa — Koleksiyonlar", type: "text", label: "Üst etiket", default: "Koleksiyonlar" },
  { key: "home.collections.title", group: "Ana Sayfa — Koleksiyonlar", type: "text", label: "Başlık", default: "Her sezon, yeni bir hikâye" },
  { key: "home.collections.subtitle", group: "Ana Sayfa — Koleksiyonlar", type: "textarea", label: "Alt metin", default: "Farklı silüetleri ve dokuları bir araya getiren koleksiyonlarımızı keşfedin." },

  // ── Ana Sayfa — Özel Dikim süreci ──
  { key: "home.process.eyebrow", group: "Ana Sayfa — Özel Dikim", type: "text", label: "Üst etiket", default: "Özel Dikim" },
  { key: "home.process.title", group: "Ana Sayfa — Özel Dikim", type: "text", label: "Başlık", default: "Tasarımdan teslime, dört adım" },
  { key: "home.process.subtitle", group: "Ana Sayfa — Özel Dikim", type: "textarea", label: "Alt metin", default: "Kişiye özel gelinlik yolculuğunuz baştan sona sizinle birlikte kurgulanır." },
  { key: "home.process.cta", group: "Ana Sayfa — Özel Dikim", type: "text", label: "Buton", default: "Özel Dikim Süreci" },
  { key: "home.process.step1.title", group: "Ana Sayfa — Özel Dikim", type: "text", label: "1. adım başlık", default: "İstişare" },
  { key: "home.process.step1.text", group: "Ana Sayfa — Özel Dikim", type: "textarea", label: "1. adım metin", default: "Atölyemizde tanışır, hayalinizdeki gelinliği ve düğün hikâyenizi birlikte dinleriz." },
  { key: "home.process.step2.title", group: "Ana Sayfa — Özel Dikim", type: "text", label: "2. adım başlık", default: "Tasarım" },
  { key: "home.process.step2.text", group: "Ana Sayfa — Özel Dikim", type: "textarea", label: "2. adım metin", default: "Silüet, kumaş ve dantel seçimleriyle size özel eskiz ve tasarım ortaya çıkar." },
  { key: "home.process.step3.title", group: "Ana Sayfa — Özel Dikim", type: "text", label: "3. adım başlık", default: "Prova" },
  { key: "home.process.step3.text", group: "Ana Sayfa — Özel Dikim", type: "textarea", label: "3. adım metin", default: "Ölçüye özel dikim, birkaç prova ile bedeninize kusursuz oturana dek işlenir." },
  { key: "home.process.step4.title", group: "Ana Sayfa — Özel Dikim", type: "text", label: "4. adım başlık", default: "Teslim" },
  { key: "home.process.step4.text", group: "Ana Sayfa — Özel Dikim", type: "textarea", label: "4. adım metin", default: "Son rötuşlarla tamamlanan gelinliğiniz, özel gününüz için sizi bekler." },

  // ── Ana Sayfa — Hikâyemiz ──
  { key: "home.story.eyebrow", group: "Ana Sayfa — Hikâyemiz", type: "text", label: "Üst etiket", default: "Hikâyemiz" },
  { key: "home.story.title", group: "Ana Sayfa — Hikâyemiz", type: "text", label: "Başlık", default: "Her ilmek, sizin hikâyeniz için." },
  {
    key: "home.story.body",
    group: "Ana Sayfa — Hikâyemiz",
    type: "textarea",
    label: "Metin",
    hint: "Paragrafları boş satırla ayırın.",
    default:
      "Celine Gelinlik, Seda Dönmez'in couture anlayışıyla şekillenir. Her gelinlik; sabırla seçilen kumaşlar, elde işlenen danteller ve saatler süren emekle, tek bir gelin için hayat bulur.\n\nAmacımız yalnızca bir gelinlik dikmek değil; o günü ve o hissi taşıyacak, size ait bir eser yaratmaktır.",
  },
  { key: "home.story.cta", group: "Ana Sayfa — Hikâyemiz", type: "text", label: "Buton", default: "Atölyeyi Keşfet" },
  { key: "home.story.image", group: "Ana Sayfa — Hikâyemiz", type: "image", label: "Görsel", default: "/gelinlikler/m01-4.jpg" },

  // ── Atölye sayfası ──
  { key: "atolye.eyebrow", group: "Atölye Sayfası", type: "text", label: "Üst etiket", default: "Atölye" },
  { key: "atolye.title", group: "Atölye Sayfası", type: "text", label: "Başlık", default: "Zarafet, el emeğiyle doğar" },
  { key: "atolye.intro", group: "Atölye Sayfası", type: "textarea", label: "Giriş metni", default: "Celine Gelinlik, couture anlayışını el işçiliğiyle buluşturan bir atölyedir. Her gelinlik; özenle seçilen kumaşlar, elde işlenen danteller ve saatler süren emekle yalnızca tek bir gelin için hayat bulur." },
  { key: "atolye.heroImage", group: "Atölye Sayfası", type: "image", label: "Arka plan görseli (bulanık)", hint: "Sayfanın üstünde bulanıklaştırılıp arka plan olarak kullanılır.", default: "/gelinlikler/m01-7.jpg" },
  { key: "atolye.storyEyebrow", group: "Atölye Sayfası", type: "text", label: "Hikâye üst etiketi", default: "Hikâyemiz" },
  { key: "atolye.storyTitle", group: "Atölye Sayfası", type: "text", label: "Hikâye başlığı", default: "Zanaatın sabrı, elin dokunuşu" },
  { key: "atolye.storyBody", group: "Atölye Sayfası", type: "textarea", label: "Hikâye metni", hint: "Paragrafları boş satırla ayırın.", default: "Celine Gelinlik, Seda Dönmez'in yılların birikimini couture bir anlayışla buluşturduğu bir atölyedir. Burada gelinlik bir üründen çok; sabırla, sevgiyle ve elle örülen bir hikâyedir.\n\nHer gelinliğin kalıbı sıfırdan, o geline özel çıkarılır. Kumaş seçimi, dantelin dokunuşu, her boncuğun yeri tek tek düşünülür. Makinenin hızına değil, elin sabrına güveniriz.\n\nAmacımız yalnızca güzel bir elbise dikmek değil; sizi en çok kendiniz gibi hissettiren, düğün gününüzün her karesinde yanınızda duran bir eser yaratmaktır." },
  { key: "atolye.image", group: "Atölye Sayfası", type: "image", label: "Hikâye görseli", default: "/gelinlikler/m01-1.jpg" },
  { key: "atolye.craftEyebrow", group: "Atölye Sayfası", type: "text", label: "Zanaat üst etiketi", default: "Atölyede" },
  { key: "atolye.craftTitle", group: "Atölye Sayfası", type: "text", label: "Zanaat başlığı", default: "Her dikişte özen" },
  { key: "atolye.craftSubtitle", group: "Atölye Sayfası", type: "textarea", label: "Zanaat alt metni", default: "Couture, acele etmeden ve hakkını vererek çalışmaktır. Atölyemizde her gelinlik bu anlayışla hayat bulur." },
  { key: "atolye.craft1.title", group: "Atölye Sayfası", type: "text", label: "Zanaat 1 başlık", default: "El emeği" },
  { key: "atolye.craft1.text", group: "Atölye Sayfası", type: "textarea", label: "Zanaat 1 metin", default: "Dantel aplikeler, boncuk ve pul işlemeler tek tek elle işlenir. Sabır isteyen her detay, gelinliğinize ruh katar." },
  { key: "atolye.craft2.title", group: "Atölye Sayfası", type: "text", label: "Zanaat 2 başlık", default: "Ölçüye özel kalıp" },
  { key: "atolye.craft2.text", group: "Atölye Sayfası", type: "textarea", label: "Zanaat 2 metin", default: "Hazır beden yoktur. Kalıbınız yalnızca sizin ölçülerinize göre çıkarılır; provalarla milimetrik olarak size uyarlanır." },
  { key: "atolye.craft3.title", group: "Atölye Sayfası", type: "text", label: "Zanaat 3 başlık", default: "Seçkin kumaşlar" },
  { key: "atolye.craft3.text", group: "Atölye Sayfası", type: "textarea", label: "Zanaat 3 metin", default: "İpek, tül, kristal organze ve el işi dantel gibi özenle seçilmiş kumaşlarla çalışır; dokunuşun ve düşüşün hakkını veririz." },

  // ── İletişim sayfası ──
  { key: "iletisim.eyebrow", group: "İletişim Sayfası", type: "text", label: "Üst etiket", default: "İletişim" },
  { key: "iletisim.title", group: "İletişim Sayfası", type: "text", label: "Başlık", default: "Bize ulaşın" },
  { key: "iletisim.subtitle", group: "İletişim Sayfası", type: "textarea", label: "Alt metin", default: "Atölyemizde birebir görüşme, sorularınız ve randevu talepleriniz için size en kısa sürede dönüş yapmaktan mutluluk duyarız." },
  { key: "iletisim.hoursTitle", group: "İletişim Sayfası", type: "text", label: "Saatler başlığı", default: "Çalışma Saatleri" },
  { key: "iletisim.hours", group: "İletişim Sayfası", type: "textarea", label: "Çalışma saatleri", hint: "Her satır: Gün | Saat", default: "Pazartesi – Cuma | 10.00 – 19.00\nCumartesi | 10.00 – 18.00\nPazar | Randevu ile" },
];

/** Anahtar → varsayılan değer haritası (kayıt yoksa buradan). */
export const CONTENT_DEFAULTS: ContentMap = Object.fromEntries(
  CONTENT_REGISTRY.map((f) => [f.key, f.default]),
);

/** Alanları grup sırasına göre koruyarak gruplar (admin formu için). */
export function contentGroups(): { group: string; fields: ContentField[] }[] {
  const order: string[] = [];
  const byGroup = new Map<string, ContentField[]>();
  for (const f of CONTENT_REGISTRY) {
    if (!byGroup.has(f.group)) {
      byGroup.set(f.group, []);
      order.push(f.group);
    }
    byGroup.get(f.group)!.push(f);
  }
  return order.map((group) => ({ group, fields: byGroup.get(group)! }));
}

/** Değer varsa onu, yoksa varsayılanı döndürür. */
export function c(map: ContentMap | null | undefined, key: string): string {
  const v = map?.[key];
  if (typeof v === "string" && v.trim().length > 0) return v;
  return CONTENT_DEFAULTS[key] ?? "";
}

/** Metni paragraflara böler (boş satır ya da satır sonu ile). */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
