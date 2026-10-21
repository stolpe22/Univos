import { describe, expect, it } from "vitest";
import {
  ehSpoiler,
  momentoDoComentario,
  paginaPelaSituacao,
  passo,
  porcentagem,
  posicao,
  situacaoDaLeitura,
  situacaoPelaPagina,
} from "./regras";

describe("posição no livro (edições diferentes)", () => {
  it("é a fração lida da própria edição", () => {
    expect(posicao(150, 600)).toBe(0.25);
    expect(posicao(140, 200)).toBe(0.7);
    expect(posicao(999, 200)).toBe(1);
    expect(posicao(10, 0)).toBe(0);
  });
});

describe("spoiler", () => {
  it("compara a posição no livro, não o número da página", () => {
    // Karol comentou na pág. 150 de uma edição de 600 (25%); eu estou na 140 de 200 (70%).
    expect(
      ehSpoiler({ posicao: posicao(150, 600), autor: "karol" }, posicao(140, 200), "lucas"),
    ).toBe(false);
    // Karol comentou na pág. 100 de 200 (50%); eu estou na 120 de 400 (30%).
    expect(
      ehSpoiler({ posicao: posicao(100, 200), autor: "karol" }, posicao(120, 400), "lucas"),
    ).toBe(true);
  });

  it("mesma posição não é spoiler", () => {
    expect(ehSpoiler({ posicao: 0.5, autor: "karol" }, 0.5, "lucas")).toBe(false);
  });

  it("nunca esconde o meu próprio comentário", () => {
    expect(ehSpoiler({ posicao: 0.9, autor: "lucas" }, 0.1, "lucas")).toBe(false);
  });
});

describe("página", () => {
  it("passo de ±10 fica entre 0 e o total", () => {
    expect(passo(5, -10, 320)).toBe(0);
    expect(passo(315, 10, 320)).toBe(320);
    expect(passo(100, 10, 320)).toBe(110);
  });

  it("porcentagem arredonda e limita", () => {
    expect(porcentagem(160, 320)).toBe(50);
    expect(porcentagem(999, 320)).toBe(100);
    expect(porcentagem(10, 0)).toBe(0);
  });
});

describe("situação da leitura", () => {
  it("última página conta como lido, mesmo marcado como lendo", () => {
    expect(situacaoDaLeitura("lendo", 312, 312)).toBe("lido");
    expect(situacaoDaLeitura("nao_lido", 400, 312)).toBe("lido");
  });

  it("no meio do livro é lendo; Já li sempre vale", () => {
    expect(situacaoDaLeitura("nao_lido", 10, 312)).toBe("lendo");
    expect(situacaoDaLeitura("lendo", 155, 265)).toBe("lendo");
    expect(situacaoDaLeitura("lido", 0, 312)).toBe("lido");
    expect(situacaoDaLeitura("nao_lido", 0, 312)).toBe("nao_lido");
  });
});

describe("formulário do exemplar: página e situação andam juntas", () => {
  it("digitar a última página vira Já li; voltar a página tira o Já li", () => {
    expect(situacaoPelaPagina("lendo", 312, 312)).toBe("lido");
    expect(situacaoPelaPagina("lido", 200, 312)).toBe("lendo");
    expect(situacaoPelaPagina("nao_lido", 5, 312)).toBe("lendo");
    expect(situacaoPelaPagina("lido", 0, 312)).toBe("nao_lido");
    expect(situacaoPelaPagina("lendo", 0, 312)).toBe("lendo");
  });

  it("escolher Já li leva ao total; Ainda não comecei volta para 0", () => {
    expect(paginaPelaSituacao("lido", 120, 312)).toBe(312);
    expect(paginaPelaSituacao("nao_lido", 120, 312)).toBe(0);
    expect(paginaPelaSituacao("lendo", 120, 312)).toBe(120);
  });
});

describe("selo do comentário", () => {
  it("diz se foi escrito antes, durante ou depois da leitura", () => {
    expect(momentoDoComentario("nao_lido", 0, 300)).toBe("antes de ler");
    expect(momentoDoComentario("lendo", 120, 300)).toBe("lendo · pág. 120 de 300 (40%)");
    expect(momentoDoComentario("lido", 300, 300)).toBe("depois de ler");
  });
});
