import { z } from "zod";
import { limparEspacos } from "@/lib/texto";
import { STATUS_LEITURA, type StatusLeitura } from "./taxonomia";

/** Campo vazio vira "não informado"; preenchido, vira número e é validado. */
const vazioComoNada = (valor: unknown) =>
  valor === "" || valor === null || valor === undefined ? undefined : valor;

const inteiroOpcional = (min: number, max: number, mensagem: string) =>
  z.preprocess(
    vazioComoNada,
    z.coerce
      .number({ error: mensagem })
      .int(mensagem)
      .min(min, mensagem)
      .max(max, mensagem)
      .optional(),
  );

const textoOpcional = (max: number, nome: string) =>
  z.string().trim().max(max, `${nome} pode ter até ${max} caracteres.`).optional();

const PAGINAS = "Digite um número inteiro entre 1 e 3000.";

export const livroSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Digite o título do livro.")
    .max(160, "O título pode ter até 160 caracteres."),
  autor: z
    .string()
    .trim()
    .min(1, "Digite o nome de quem escreveu.")
    .max(120, "O nome pode ter até 120 caracteres."),
  paginas: z.coerce.number({ error: PAGINAS }).int(PAGINAS).min(1, PAGINAS).max(3000, PAGINAS),
  tema: z.preprocess(vazioComoNada, z.string().max(80, "Escolha um tema da lista.").optional()),
  tipo: z.preprocess(vazioComoNada, z.string().max(60, "Escolha um tipo da lista.").optional()),
  nivel: inteiroOpcional(1, 32767, "Escolha um nível da lista."),
  anoPublicacao: inteiroOpcional(
    -3000,
    2200,
    "Digite o ano com números, ex: 1945 (antes de Cristo, use número negativo).",
  ),
  editora: textoOpcional(120, "A editora"),
  precoReferencia: z.preprocess(
    vazioComoNada,
    z.coerce
      .number({ error: "Digite o preço só com números, ex: 49.90." })
      .min(0, "O preço não pode ser negativo.")
      .max(10_000_000, "Esse preço parece alto demais. Confira o valor.")
      .optional(),
  ),
  nota: textoOpcional(1000, "A nota"),
});

export type LivroForm = z.infer<typeof livroSchema>;

const PAGINAS_EDICAO = "Digite quantas páginas tem o seu exemplar (de 1 a 30000).";

export const progressoPessoalSchema = z
  .object({
    livroId: z.coerce.number().int().positive(),
    paginasEdicao: z.coerce
      .number({ error: PAGINAS_EDICAO })
      .int(PAGINAS_EDICAO)
      .min(1, PAGINAS_EDICAO)
      .max(30000, PAGINAS_EDICAO),
    pagina: z.coerce
      .number({ error: "Digite a página em que você está, ex: 120." })
      .int("Digite a página em que você está, ex: 120.")
      .min(0, "A página não pode ser negativa."),
    status: z.enum(
      STATUS_LEITURA.map((s) => s.valor) as [StatusLeitura, ...StatusLeitura[]],
      "Escolha a situação da leitura.",
    ),
  })
  .refine((dados) => dados.pagina <= dados.paginasEdicao, {
    path: ["pagina"],
    message: "A página atual não pode passar do total da sua edição.",
  });

export const CATEGORIAS = ["tema", "tipo", "nivel"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

/** Nova opção do catálogo (só o dono cadastra). Tema aceita nome um pouco maior. */
export const categoriaSchema = z
  .object({
    categoria: z.enum(CATEGORIAS, "Escolha se é tema, tipo ou nível."),
    nome: z.string().transform(limparEspacos),
  })
  .superRefine(({ categoria, nome }, ctx) => {
    const limite = categoria === "tema" ? 80 : 60;
    if (nome.length < 2 || nome.length > limite) {
      ctx.addIssue({
        code: "custom",
        path: ["nome"],
        message: `Digite um nome entre 2 e ${limite} caracteres.`,
      });
    }
  });
