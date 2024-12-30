import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true, // מאפשר להתעלם משגיאות בזמן בנייה
  },
};

export default nextConfig;
