import { ImageResponse } from "next/og";
import { logoDataUri, MARCA } from "@/lib/logo";

// Ícone quando alguém salva o Uni-vos na tela inicial do iPhone.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: MARCA.branco,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- imagem gerada, não é página */}
      <img src={logoDataUri(164)} width={164} height={164} alt="" />
    </div>,
    size,
  );
}
