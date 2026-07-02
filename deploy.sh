#!/usr/bin/env bash
# Celine Gelinlik — tek komut deploy (ercan sunucusunda çalıştır)
#
#   cd /var/www/celine && ./deploy.sh
#
# Yaptığı: git pull -> pnpm install -> api build+restart -> (varsa) web build+restart -> pm2 save.
# Şema DEĞİŞTİYSE ayrıca: pnpm --filter api exec prisma db push  (ben söylerim).
set -euo pipefail
cd "$(dirname "$0")"

echo "==> git pull"
git pull --ff-only

echo "==> pnpm install"
corepack enable pnpm >/dev/null 2>&1 || true
pnpm install

echo "==> API (prisma generate + db push + build + restart)"
pnpm --filter api exec prisma generate
# Şema değişikliklerini prod DB'ye uygula (veri kaybı riski olan değişikliklerde
# prisma onay ister; öyle bir durumda deploy'u durdurur, önce yedek alın).
pnpm --filter api exec prisma db push
pnpm --filter api build
pm2 restart celine-api --update-env 2>/dev/null || ( cd apps/api && pm2 start dist/main.js --name celine-api )

if [ -f apps/web/package.json ]; then
  echo "==> WEB (build + restart)"
  pnpm --filter web build
  pm2 restart celine-web --update-env 2>/dev/null || ( cd apps/web && pm2 start npm --name celine-web -- start )
fi

pm2 save
echo "==> health:"
sleep 2
if curl -sf http://127.0.0.1:4000/health; then
  echo
  echo "==> DONE ✅"
else
  echo
  echo "==> HEALTH CHECK FAILED ❌ — pm2 logs celine-api ile bakın"
  exit 1
fi
