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

  // ── Alt bilgi (footer) ──
  { key: "footer.tagline", group: "Alt Bilgi (Footer)", type: "textarea", label: "Marka sloganı", default: "Seda Dönmez Couture — kişiye özel, ölçüye özel gelinlik tasarımı. Her gelin için tek ve eşsiz." },

  // ── Gerçek Gelinler sayfası ──
  { key: "gercek.eyebrow", group: "Gerçek Gelinler Sayfası", type: "text", label: "Üst etiket", default: "Gerçek Gelinler" },
  { key: "gercek.title", group: "Gerçek Gelinler Sayfası", type: "text", label: "Başlık", default: "Kendi hikâyesini yaşayan gelinler" },
  { key: "gercek.subtitle", group: "Gerçek Gelinler Sayfası", type: "textarea", label: "Alt metin", default: "Celine gelinliklerini giyen gelinlerimizin düğün günü kareleri ve kelimeleri. Bu galeriyi zamanla, gerçek gelinlerimizin anılarıyla dolduruyoruz." },
  { key: "gercek.soonLabel", group: "Gerçek Gelinler Sayfası", type: "text", label: "Yakında etiketi", default: "Yakında" },
  { key: "gercek.soonText", group: "Gerçek Gelinler Sayfası", type: "textarea", label: "Yakında metni", default: "Gelinlerimizin gerçek düğün fotoğraflarını ve hikâyelerini paylaşmak için sabırsızlanıyoruz. Yakında bu sayfa, size ilham verecek gerçek anılarla dolacak." },

  // ── Özel Dikim sayfası ──
  { key: "ozeldikim.eyebrow", group: "Özel Dikim Sayfası", type: "text", label: "Üst etiket", default: "Özel Dikim" },
  { key: "ozeldikim.title", group: "Özel Dikim Sayfası", type: "text", label: "Başlık", default: "Yalnızca size ait, ölçüye özel bir gelinlik" },
  { key: "ozeldikim.subtitle", group: "Özel Dikim Sayfası", type: "textarea", label: "Alt metin", default: "Celine Gelinlik'te her gelinlik sıfırdan, size özel tasarlanır ve elde dikilir. Hazır bir kalıp değil; sizin hikâyenizden, siluetinizden ve kumaşınızdan doğan tek bir eser." },
  { key: "ozeldikim.cta", group: "Özel Dikim Sayfası", type: "text", label: "Buton", default: "Randevu Al" },
  { key: "ozeldikim.image", group: "Özel Dikim Sayfası", type: "image", label: "Giriş görseli", default: "/gelinlikler/m07-1.jpg" },
  { key: "ozeldikim.processEyebrow", group: "Özel Dikim Sayfası", type: "text", label: "Süreç üst etiketi", default: "Süreç" },
  { key: "ozeldikim.processTitle", group: "Özel Dikim Sayfası", type: "text", label: "Süreç başlığı", default: "Dört adımda couture yolculuğu" },
  { key: "ozeldikim.processSubtitle", group: "Özel Dikim Sayfası", type: "textarea", label: "Süreç alt metni", default: "İlk sohbetten teslim gününe kadar her aşamada yanınızdayız. Acele etmeden, hakkını vererek." },
  { key: "ozeldikim.step1.title", group: "Özel Dikim Sayfası", type: "text", label: "1. adım başlık", default: "İstişare" },
  { key: "ozeldikim.step1.duration", group: "Özel Dikim Sayfası", type: "text", label: "1. adım süre", default: "İlk buluşma" },
  { key: "ozeldikim.step1.text", group: "Özel Dikim Sayfası", type: "textarea", label: "1. adım metin", default: "Atölyemizde birebir tanışıyoruz. Hayalinizdeki silueti, düğün konseptinizi ve size en yakışan kumaşları konuşuyor; vücut tipiniz ve tarzınız üzerine sakin bir sohbetle yolculuğun tonunu belirliyoruz." },
  { key: "ozeldikim.step2.title", group: "Özel Dikim Sayfası", type: "text", label: "2. adım başlık", default: "Tasarım & Eskiz" },
  { key: "ozeldikim.step2.duration", group: "Özel Dikim Sayfası", type: "text", label: "2. adım süre", default: "2–4 hafta" },
  { key: "ozeldikim.step2.text", group: "Özel Dikim Sayfası", type: "textarea", label: "2. adım metin", default: "Sizin için özgün bir tasarım çiziyoruz. Eskizler, kumaş ve dantel numuneleri, boncuk ve işleme detayları üzerinde birlikte karar veriyoruz. Her çizgi yalnızca sizin gelinliğiniz için düşünülüyor." },
  { key: "ozeldikim.step3.title", group: "Özel Dikim Sayfası", type: "text", label: "3. adım başlık", default: "Provalar" },
  { key: "ozeldikim.step3.duration", group: "Özel Dikim Sayfası", type: "text", label: "3. adım süre", default: "Birkaç prova" },
  { key: "ozeldikim.step3.text", group: "Özel Dikim Sayfası", type: "textarea", label: "3. adım metin", default: "Kalıbınız sıfırdan, ölçünüze göre çıkarılıyor. Ardışık provalarla duruş, kumaşın akışı ve her dikiş milimetrik olarak size uyarlanıyor. Bedeninizde kusursuz oturana kadar birlikte çalışıyoruz." },
  { key: "ozeldikim.step4.title", group: "Özel Dikim Sayfası", type: "text", label: "4. adım başlık", default: "Dikim & Teslim" },
  { key: "ozeldikim.step4.duration", group: "Özel Dikim Sayfası", type: "text", label: "4. adım süre", default: "Son rötuşlar" },
  { key: "ozeldikim.step4.text", group: "Özel Dikim Sayfası", type: "textarea", label: "4. adım metin", default: "El emeği işlemeler, son ütü ve dikkatli bir kalite kontrolünün ardından gelinliğiniz teslime hazır. Düğün gününüzde tek ve size özel bir eserle salona adım atıyorsunuz." },
  { key: "ozeldikim.timeEyebrow", group: "Özel Dikim Sayfası", type: "text", label: "Zaman üst etiketi", default: "Zaman planı" },
  { key: "ozeldikim.timeTitle", group: "Özel Dikim Sayfası", type: "text", label: "Zaman başlığı", default: "Yaklaşık 6–12 ay" },
  { key: "ozeldikim.timeText", group: "Özel Dikim Sayfası", type: "textarea", label: "Zaman metni", default: "Ölçüye özel bir gelinlik zaman ister. İdeal olarak düğününüzden 6 ila 12 ay önce sürece başlamanızı öneririz; böylece tasarım, provalar ve el işçiliği için gereken zaman rahatça açılır. Daha kısa süreler için lütfen bizimle görüşün, birlikte değerlendirelim." },
  { key: "ozeldikim.remoteEyebrow", group: "Özel Dikim Sayfası", type: "text", label: "Şehir dışı üst etiketi", default: "Şehir dışı gelinler" },
  { key: "ozeldikim.remoteTitle", group: "Özel Dikim Sayfası", type: "text", label: "Şehir dışı başlığı", default: "Uzaktan da yanınızdayız" },
  { key: "ozeldikim.remoteText", group: "Özel Dikim Sayfası", type: "textarea", label: "Şehir dışı metni", default: "İstanbul dışında yaşıyorsanız süreci sizin için kolaylaştırıyoruz. İlk istişareyi ve ara görüşmeleri video ile yapabilir, provaları birkaç ziyarete toplayabiliriz. Randevu oluştururken şehir dışında olduğunuzu belirtmeniz yeterli." },
  { key: "ozeldikim.bandImage", group: "Özel Dikim Sayfası", type: "image", label: "Parallax bant görseli", default: "/gelinlikler/m01-7.jpg" },
  { key: "ozeldikim.bandLine", group: "Özel Dikim Sayfası", type: "textarea", label: "Parallax bant cümlesi", default: "Her ilmek sabırla atılır; her gelinlik, tek bir hikâye için." },
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
