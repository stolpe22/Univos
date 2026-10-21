"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, classesInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useRetornoForm } from "@/components/ui/useRetornoForm";
import type { EstadoForm } from "@/lib/resultado";
import { adicionarCategoria, sugerirLivro, tirarDaEstante } from "./actions";
import type { TaxonomiaCatalogo } from "./queries";
import type { Categoria } from "./schemas";

type Campos =
  | "titulo"
  | "autor"
  | "paginas"
  | "tema"
  | "tipo"
  | "nivel"
  | "anoPublicacao"
  | "editora"
  | "precoReferencia"
  | "nota";

/**
 * Sugerir livro para a estante (sem duplicado). A classificação é opcional e fica fechada,
 * pra quem só quer sugerir não ver um formulário enorme (heurística 8).
 */
export function SugerirLivroForm({
  taxonomia,
  admin,
  aoAdicionar,
}: {
  taxonomia: TaxonomiaCatalogo;
  /** O dono do sistema pode criar opções novas de tema, tipo e nível. */
  admin: boolean;
  /** Recebe o id do livro criado (ex: "Meus livros" já seleciona ele). */
  aoAdicionar?: (id: number) => void;
}) {
  const [estado, acao, enviando] = useActionState<EstadoForm<Campos>, FormData>(sugerirLivro, null);
  const form = useRef<HTMLFormElement>(null);
  useRetornoForm(estado, form, {
    desfazer: (id) => tirarDaEstante(id as number),
    aoOk: (id) => aoAdicionar?.(id as number),
  });
  const erros = estado && !estado.ok ? estado.erros : {};
  const valores = estado && !estado.ok ? estado.valores : {};

  return (
    <form ref={form} action={acao} noValidate className="grid gap-3">
      <Field
        label="Título"
        name="titulo"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={160}
        placeholder="Ex: A Revolução dos Bichos"
        defaultValue={valores.titulo ?? ""}
        erro={erros.titulo}
      />
      <Field
        label="Autor"
        name="autor"
        autoComplete="off"
        enterKeyHint="next"
        maxLength={120}
        placeholder="Ex: George Orwell"
        defaultValue={valores.autor ?? ""}
        erro={erros.autor}
      />
      <Field
        label="Número de páginas"
        name="paginas"
        type="number"
        inputMode="numeric"
        enterKeyHint="done"
        min={1}
        max={3000}
        placeholder="Ex: 152"
        hint="Estimativa da edição de referência; cada pessoa pode informar as páginas da própria edição."
        defaultValue={valores.paginas ?? ""}
        erro={erros.paginas}
      />
      <details className="rounded-xl border border-line p-3">
        <summary className="min-h-11 cursor-pointer content-center font-semibold text-accent">
          Classificação e dados do catálogo (opcional)
        </summary>
        <div className="mt-3 grid gap-3">
          <CampoTaxonomia
            categoria="tema"
            label="Tema"
            valorInicial={valores.tema ?? ""}
            erro={erros.tema}
            admin={admin}
            opcoes={taxonomia.temas.map((t) => ({ valor: t.codigo, rotulo: t.nome }))}
          />
          <CampoTaxonomia
            categoria="tipo"
            label="Tipo de livro"
            valorInicial={valores.tipo ?? ""}
            erro={erros.tipo}
            admin={admin}
            opcoes={taxonomia.tipos.map((t) => ({ valor: t.nome, rotulo: t.nome }))}
          />
          <CampoTaxonomia
            categoria="nivel"
            label="Nível de leitura"
            valorInicial={valores.nivel ?? ""}
            erro={erros.nivel}
            admin={admin}
            opcoes={taxonomia.niveis.map((n) => ({ valor: String(n.nivel), rotulo: n.nome }))}
          />
          <details className="rounded-lg border border-line p-3">
            <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold">
              Dados da edição de referência
            </summary>
            <div className="mt-3 grid gap-3">
              <Field
                label="Ano de publicação"
                name="anoPublicacao"
                type="number"
                inputMode="numeric"
                min={-3000}
                max={2200}
                erro={erros.anoPublicacao}
                defaultValue={valores.anoPublicacao ?? ""}
              />
              <Field
                label="Editora"
                name="editora"
                maxLength={120}
                erro={erros.editora}
                defaultValue={valores.editora ?? ""}
              />
              <Field
                label="Preço de referência (R$)"
                name="precoReferencia"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                erro={erros.precoReferencia}
                defaultValue={valores.precoReferencia ?? ""}
              />
              <Field
                label="Nota sobre o livro"
                name="nota"
                maxLength={1000}
                erro={erros.nota}
                defaultValue={valores.nota ?? ""}
              />
            </div>
          </details>
        </div>
      </details>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Adicionando…" : "Adicionar à estante"}
      </Button>
    </form>
  );
}

type Opcao = { valor: string; rotulo: string };

/** Select de tema/tipo/nível. O dono pode criar uma opção nova sem sair do formulário. */
function CampoTaxonomia({
  categoria,
  label,
  opcoes,
  valorInicial,
  admin,
  erro,
}: {
  categoria: Categoria;
  label: string;
  opcoes: Opcao[];
  valorInicial: string;
  admin: boolean;
  erro?: string;
}) {
  const { toast } = useToast();
  const [selecionado, setSelecionado] = useState(valorInicial);
  const [criada, setCriada] = useState<Opcao | null>(null);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [salvando, startTransition] = useTransition();
  const lista =
    criada && !opcoes.some((o) => o.valor === criada.valor) ? [...opcoes, criada] : opcoes;

  function salvar() {
    startTransition(async () => {
      const r = await adicionarCategoria(categoria, nome);
      if (!r.ok) return toast(r.erro);
      setCriada({ valor: r.valor, rotulo: r.nome });
      setSelecionado(r.valor);
      setNome("");
      setCriando(false);
      toast("Opção adicionada ao catálogo.");
    });
  }

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
        <Field label={label} erro={erro}>
          {(controle) => (
            <select
              {...controle}
              name={categoria}
              value={selecionado}
              onChange={(e) => setSelecionado(e.target.value)}
              className={classesInput}
            >
              <option value="">Não informado</option>
              {lista.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          )}
        </Field>
        {admin && (
          <Button
            variante="ghost"
            tamanho="small"
            aria-label={`Criar ${label.toLowerCase()}`}
            aria-expanded={criando}
            onClick={() => setCriando((c) => !c)}
          >
            + Criar
          </Button>
        )}
      </div>
      {admin && criando && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 rounded-xl border border-line bg-bg p-3">
          <Field
            label={`Novo ${label.toLowerCase()}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            // Enter cria a opção em vez de enviar o formulário do livro
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                salvar();
              }
            }}
            maxLength={categoria === "tema" ? 80 : 60}
            placeholder="Digite o nome"
          />
          <Button disabled={salvando} onClick={salvar}>
            {salvando ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      )}
    </div>
  );
}
