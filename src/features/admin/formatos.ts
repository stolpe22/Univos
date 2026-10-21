const PAPEIS: Record<string, string> = {
  membro: "membro",
  moderador: "moderador",
};

export function nomePapel(papel: string) {
  return PAPEIS[papel] ?? papel;
}

type Evento = {
  acao: string;
  autor: string;
  alvo: string | null;
  convite: string | null;
  detalhes: Record<string, string>;
};

/** Frase da auditoria em linguagem do grupo ("Karol entrou pelo link “grupo do zap”"). */
export function descreverEvento(e: Evento) {
  const rotulo = `“${e.convite ?? e.detalhes.rotulo ?? "apagado"}”`;
  switch (e.acao) {
    case "grupo_criado":
      return `${e.autor} criou o grupo “${e.detalhes.nome ?? "sem nome"}”`;
    case "convite_criado":
      return `${e.autor} gerou o link ${rotulo}`;
    case "convite_desativado":
      return `${e.autor} desativou o link ${rotulo}`;
    case "convite_reativado":
      return `${e.autor} reativou o link ${rotulo}`;
    case "entrou_por_convite":
      return `${e.autor} entrou pelo link ${rotulo}`;
    case "papel_alterado":
      return `${e.autor} mudou ${e.alvo ?? "alguém"} de ${nomePapel(e.detalhes.de)} para ${nomePapel(e.detalhes.para)}`;
    default:
      return `${e.autor}: ${e.acao}`;
  }
}
