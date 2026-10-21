import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const DESCRICAO = "Esquerda, direita e quem tá no meio: uni-vos. Clube do livro e de debates.";

/** Endereço público do site: as prévias de link (WhatsApp) precisam de URL completa. */
const SITE = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { template: "%s · Uni-vos", default: "Uni-vos" },
  description: DESCRICAO,
  applicationName: "Uni-vos",
  // Prévia do link (WhatsApp, Telegram…). A imagem vem de app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Uni-vos",
    title: "Uni-vos",
    description: DESCRICAO,
  },
  twitter: { card: "summary_large_image", title: "Uni-vos", description: DESCRICAO },
};

// Nunca bloquear zoom (WCAG 1.4.4): sem maximumScale nem userScalable.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#7b3fe4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
