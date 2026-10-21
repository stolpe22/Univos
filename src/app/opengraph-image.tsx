import { ImageResponse } from "next/og";
import { fontesDaMarca } from "@/lib/fontesImagem";
import { logoDataUri, MARCA } from "@/lib/logo";

// Prévia do link (Open Graph): a arte que aparece ao colar o link no WhatsApp.
export const alt =
  "Uni-vos: esquerda, direita e quem tá no meio, uni-vos. Clube do livro e debates.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ETIQUETAS = [
  { texto: "tese", cor: MARCA.azul },
  { texto: "antítese", cor: MARCA.vermelho },
  { texto: "síntese", cor: MARCA.roxo },
];

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: "0 90px",
        background: MARCA.noite,
        backgroundImage: MARCA.degrade,
        color: MARCA.branco,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          borderRadius: 999,
          padding: 10,
          background: "rgba(255,255,255,.28)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem gerada, não é página */}
        <img src={logoDataUri(280)} width={280} height={280} alt="" />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: "Fraunces", fontSize: 128, fontWeight: 700, lineHeight: 1 }}>
          Uni-vos
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
          {ETIQUETAS.map((e) => (
            <div
              key={e.texto}
              style={{
                background: e.cor,
                borderRadius: 999,
                padding: "6px 22px",
                fontSize: 30,
                fontWeight: 600,
                border: `2px solid rgba(255,255,255,.55)`,
              }}
            >
              {e.texto}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 40, marginTop: 34, maxWidth: 640, lineHeight: 1.25 }}>
          Esquerda, direita e quem tá no meio: uni-vos.
        </div>
        <div style={{ fontSize: 32, marginTop: 14, opacity: 0.9 }}>Clube do livro & debates</div>
      </div>
    </div>,
    { ...size, fonts: await fontesDaMarca() },
  );
}
