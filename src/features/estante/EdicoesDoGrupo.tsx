"use client";

import { useActionState, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Card";
import { Field, classesInput } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import { paginaPelaSituacao, porcentagem, situacaoPelaPagina } from "@/features/livro/regras";
import { formatarData } from "@/lib/datas";
import type { EstadoForm } from "@/lib/resultado";
import {
  desfazerProgressoPessoal,
  salvarProgressoPessoal,
  type ProgressoAnterior,
} from "./actions";
import type { EdicaoLeitura, LivroEstante } from "./queries";
import { rotuloStatus, STATUS_LEITURA, type StatusLeitura } from "./taxonomia";

/**
 * Exemplares do grupo: cada pessoa informa as páginas da própria edição e até onde leu.
 * Fechado por padrão para a estante não ficar enorme.
 */
export function EdicoesDoGrupo({
  livro,
  eu,
  abertoInicial = false,
}: {
  livro: LivroEstante;
  eu: string;
  abertoInicial?: boolean;
}) {
  return (
    <details open={abertoInicial} className="mt-2 rounded-xl border border-line bg-bg">
      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3 text-sm font-semibold text-accent">
        <span>Exemplares e progresso do grupo ({livro.leituras.length})</span>
        <span aria-hidden="true" className="shrink-0">
          ⌄
        </span>
      </summary>
      <div className="grid gap-3 border-t border-line p-3">
        {livro.leituras.length === 0 ? (
          <p className="m-0 text-sm text-muted">Ninguém cadastrou a própria edição ainda.</p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {livro.leituras.map((l) => (
              <ItemLeitura key={l.userId} leitura={l} titulo={livro.titulo} />
            ))}
          </ul>
        )}
        <MeuExemplar
          livro={livro}
          minha={livro.leituras.find((l) => l.userId === eu)}
          cadastrando={abertoInicial}
        />
      </div>
    </details>
  );
}

function ItemLeitura({ leitura: l, titulo }: { leitura: EdicaoLeitura; titulo: string }) {
  return (
    <li className="grid gap-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar nome={l.nome} cor={l.cor} icone={l.icone} className="size-9 text-sm" />
        <b className="min-w-0 flex-1 break-words">{l.nome}</b>
        <Pill className="shrink-0">{rotuloStatus(l.status)}</Pill>
      </div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-muted">
          Página {l.pagina} de {l.paginas}
        </span>
        <b>{porcentagem(l.pagina, l.paginas)}%</b>
      </div>
      <ProgressBar
        valor={l.pagina}
        max={l.paginas}
        rotulo={`Progresso de ${l.nome} em ${titulo}`}
      />
      <span className="text-[13px] text-muted">
        {l.temEdicao ? "Edição própria" : "Usando a estimativa da referência"}
        {l.atualizadoEm ? ` · Atualizado em ${formatarData(l.atualizadoEm)}` : ""}
      </span>
    </li>
  );
}

/**
 * Quem já tem o exemplar vê o formulário para atualizar. Quem não tem vê só o botão
 * "Eu tenho este livro": abrir o painel não cadastra nada, só salvar cadastra.
 */
function MeuExemplar({
  livro,
  minha,
  cadastrando: inicial,
}: {
  livro: LivroEstante;
  minha?: EdicaoLeitura;
  cadastrando: boolean;
}) {
  const [cadastrando, setCadastrando] = useState(inicial);
  if (minha || cadastrando) return <MinhaEdicaoForm livro={livro} minha={minha} />;
  return (
    <div className="grid gap-2 border-t border-line pt-3">
      <p className="m-0 text-sm text-muted">
        Você não cadastrou um exemplar deste livro. Se tiver um, cadastre para o grupo ver seu
        progresso. Ele também vai aparecer em Meus livros.
      </p>
      <Button variante="ghost" onClick={() => setCadastrando(true)}>
        Eu tenho este livro
      </Button>
    </div>
  );
}

type Campos = "livroId" | "paginasEdicao" | "pagina" | "status";

function MinhaEdicaoForm({ livro, minha }: { livro: LivroEstante; minha?: EdicaoLeitura }) {
  const [estado, acao, salvando] = useActionState<EstadoForm<Campos>, FormData>(
    salvarProgressoPessoal,
    null,
  );
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form, {
    desfazer: (d) => {
      const { livroId, anterior } = d as { livroId: number; anterior: ProgressoAnterior };
      return desfazerProgressoPessoal(livroId, anterior);
    },
  });
  const erros = estado && !estado.ok ? estado.erros : {};
  // página e situação andam juntas: última página = Já li, e Já li leva a página ao total
  const [total, setTotal] = useState(minha ? String(minha.paginas) : "");
  const [pagina, setPagina] = useState(String(minha?.pagina ?? 0));
  const [situacao, setSituacao] = useState<StatusLeitura>(minha?.status ?? "nao_lido");
  // salvou ou desfez: o servidor manda os valores novos e o formulário volta a mostrá-los
  const salvo = `${minha?.paginas}-${minha?.pagina}-${minha?.status}`;
  const [ultimoSalvo, setUltimoSalvo] = useState(salvo);
  if (salvo !== ultimoSalvo) {
    setUltimoSalvo(salvo);
    setTotal(minha ? String(minha.paginas) : "");
    setPagina(String(minha?.pagina ?? 0));
    setSituacao(minha?.status ?? "nao_lido");
  }

  function mudarTotal(valor: string) {
    setTotal(valor);
    const novo = Number(valor);
    if (!valor || !Number.isFinite(novo)) return;
    if (situacao === "lido") setPagina(String(novo));
    else setSituacao(situacaoPelaPagina(situacao, Number(pagina), novo));
  }
  function mudarPagina(valor: string) {
    setPagina(valor);
    if (valor && total) setSituacao(situacaoPelaPagina(situacao, Number(valor), Number(total)));
  }
  function mudarSituacao(valor: StatusLeitura) {
    setSituacao(valor);
    setPagina(String(paginaPelaSituacao(valor, Number(pagina), Number(total) || 0)));
  }

  return (
    <form ref={form} action={acao} noValidate className="grid gap-3 border-t border-line pt-3">
      <input type="hidden" name="livroId" value={livro.id} />
      <p className="m-0 font-semibold">
        {minha ? "Atualizar minha edição" : "Cadastrar meu exemplar"}
      </p>
      <Field
        label="Páginas na minha edição"
        name="paginasEdicao"
        type="number"
        inputMode="numeric"
        min={1}
        max={30000}
        hint={`A referência tem cerca de ${livro.paginas} páginas. Informe o total impresso no seu exemplar.`}
        value={total}
        onChange={(e) => mudarTotal(e.target.value)}
        erro={erros.paginasEdicao}
      />
      <Field
        label="Página em que estou"
        name="pagina"
        type="number"
        inputMode="numeric"
        min={0}
        max={Number(total) || 30000}
        value={pagina}
        onChange={(e) => mudarPagina(e.target.value)}
        erro={erros.pagina}
      />
      <Field
        label="Situação da leitura"
        hint="Ao escolher Já li, a página vai para o total da sua edição; ao chegar na última página, a situação vira Já li. O grupo vê essa informação."
        erro={erros.status}
      >
        {(controle) => (
          <select
            {...controle}
            name="status"
            value={situacao}
            onChange={(e) => mudarSituacao(e.target.value as StatusLeitura)}
            className={classesInput}
          >
            {STATUS_LEITURA.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Button type="submit" disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar meu progresso"}
      </Button>
    </form>
  );
}
