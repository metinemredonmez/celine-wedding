// MediaPipe wasm dosyalarını public/'e kopyalar (demo yüz tespiti kendi alan adımızdan yüklensin).
// dev / build betikleri çalıştırır; çıktı Git dışıdır (public/mediapipe/).
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const pkg = dirname(require.resolve("@mediapipe/tasks-vision")); // paket kökündeki vision_bundle
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "mediapipe", "wasm");
if (!existsSync(join(pkg, "wasm"))) throw new Error("@mediapipe/tasks-vision/wasm bulunamadı");
mkdirSync(out, { recursive: true });
cpSync(join(pkg, "wasm"), out, { recursive: true });
console.log("mediapipe wasm →", out);
