import type { FiguraPolitica, TipoBandeira } from "./opcoes";

/**
 * Cores das ilustrações do avatar (caricaturas e bandeiras). São parte do desenho,
 * como a arte da logo em lib/logo.ts, e por isso ficam fora dos tokens do tema.
 */

type Paleta = { pele: string; cabelo: string; barba: string | null; roupa: string };

export const PALETA_FIGURAS: Record<FiguraPolitica, Paleta> = {
  che: { pele: "#c98254", cabelo: "#26231f", barba: "#24221f", roupa: "#353535" },
  lula: { pele: "#b97851", cabelo: "#d6d0c5", barba: "#ddd7cb", roupa: "#d62436" },
  bolsonaro: { pele: "#e2ad86", cabelo: "#ddd2bd", barba: null, roupa: "#14864a" },
  flavio: { pele: "#e2ad86", cabelo: "#282522", barba: null, roupa: "#2356a8" },
  renan: { pele: "#e2ad86", cabelo: "#282522", barba: "#ddd7cb", roupa: "#353535" },
};

export const TRACOS = {
  olhos: "#34251d",
  boca: "#794b38",
  boinaChe: "#386a45",
  estrelaChe: "#ead06c",
  topeteBolsonaro: "#e5d9c3",
  topeteFlavio: "#211f1d",
};

export const BANDEIRA_BRASIL = { verde: "#159447", amarelo: "#f4d33f", azul: "#2764a5" };

export const COR_BANDEIRA: Record<Exclude<TipoBandeira, "brasil">, string> = {
  partido_vermelho: "#c83240",
  partido_azul: "#3474c5",
  partido_verde: "#17834b",
};
