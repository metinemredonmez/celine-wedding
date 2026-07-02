import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudinary anahtarları/seed görsel host'ları henüz belirsiz — optimize kapalı,
    // host config derdi olmasın. İlk deploy sağlamlığı için bilinçli tercih.
    unoptimized: true,
  },
};

export default nextConfig;
