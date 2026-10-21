import type { NextConfig } from "next";

// cacheComponents fica desligado: quase todas as telas leem a sessão do Supabase
// (cookies), então renderizar sob demanda é mais simples e suficiente aqui.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
