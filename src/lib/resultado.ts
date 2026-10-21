/** Resposta padrão das server actions: deu certo (com dados) ou a mensagem do que fazer. */
export type Resultado<T = undefined> = { ok: true; dados: T } | { ok: false; erro: string };

/** Estado de formulário usado com useActionState. */
export type EstadoForm<C extends string = string> =
  | null
  | { ok: true; mensagem: string; desfazer?: unknown }
  | { ok: false; erros: Partial<Record<C | "geral", string>>; valores: Partial<Record<C, string>> };

export const ERRO_REDE = "Não deu pra salvar agora. Confira sua internet e tente de novo.";

/** Erro de valor duplicado no Postgres (índice único). */
export const DUPLICADO = "23505";
