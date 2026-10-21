"use client";

import { useState, useTransition } from "react";
import {
  Avatar,
  CATEGORIAS_ICONES,
  CORES_PERFIL,
  categoriaDoIcone,
  corDoPerfil,
  rotuloIconePerfil,
  type CategoriaIcone,
  type CorPerfil,
  type IconePerfil,
} from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { salvarAvatarPerfil } from "./actions";

type Props = { nome: string; corInicial: CorPerfil; iconeInicial: IconePerfil | "" };

/**
 * Escolha de cor e ícone com prévia ao vivo. Ao salvar, a action revalida o layout,
 * então o avatar do cabeçalho atualiza sozinho.
 */
export function AvatarPerfilForm({ nome, corInicial, iconeInicial }: Props) {
  const { toast } = useToast();
  const [cor, setCor] = useState<CorPerfil>(corInicial);
  const [icone, setIcone] = useState<IconePerfil | "">(iconeInicial);
  const [salvando, startTransition] = useTransition();

  function salvar() {
    startTransition(async () => {
      const r = await salvarAvatarPerfil(cor, icone);
      toast(r.ok ? "Avatar atualizado." : r.erro);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-bg p-3">
        <Avatar nome={nome} cor={cor} icone={icone} className="size-14 text-lg" />
        <div>
          <b>Prévia do avatar</b>
          <p className="m-0 text-sm text-muted">Assim as pessoas vão reconhecer você.</p>
        </div>
      </div>
      <SeletorCor cor={cor} aoEscolher={setCor} />
      <SeletorIcone nome={nome} cor={cor} icone={icone} aoEscolher={setIcone} />
      <Button onClick={salvar} disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar avatar"}
      </Button>
    </div>
  );
}

const OPCAO = "border-line text-ink";
const OPCAO_ATIVA = "border-accent bg-accent-soft text-accent";

function SeletorCor({ cor, aoEscolher }: { cor: CorPerfil; aoEscolher: (c: CorPerfil) => void }) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-sm font-semibold">Cor do círculo</legend>
      <div className="grid grid-cols-5 gap-2">
        {CORES_PERFIL.map((opcao) => {
          const ativa = cor === opcao.valor;
          return (
            <button
              key={opcao.valor}
              type="button"
              aria-label={opcao.rotulo}
              aria-pressed={ativa}
              title={opcao.rotulo}
              onClick={() => aoEscolher(opcao.valor)}
              className={`grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full border-2 text-white ${opcao.fundo} ${ativa ? "border-ink ring-2 ring-accent" : "border-card"}`}
            >
              {ativa && (
                <span aria-hidden="true" className="font-bold">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 mb-0 text-sm text-muted">Selecionada: {corDoPerfil(cor).rotulo}</p>
    </fieldset>
  );
}

function SeletorIcone({
  nome,
  cor,
  icone,
  aoEscolher,
}: {
  nome: string;
  cor: CorPerfil;
  icone: IconePerfil | "";
  aoEscolher: (i: IconePerfil | "") => void;
}) {
  const [categoria, setCategoria] = useState<CategoriaIcone>(categoriaDoIcone(icone));
  const opcoes = CATEGORIAS_ICONES.find((c) => c.valor === categoria)?.opcoes ?? [];
  // Ícone da primeira versão do avatar, que não está mais nas categorias: continua escolhível.
  const legado =
    icone !== "" && !CATEGORIAS_ICONES.some((c) => c.opcoes.some((o) => o.valor === icone));

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-sm font-semibold">O que aparece no círculo?</legend>
      <div role="group" aria-label="Tipo de figura" className="mb-3 flex flex-wrap gap-2">
        {CATEGORIAS_ICONES.map((c) => (
          <button
            key={c.valor}
            type="button"
            aria-pressed={categoria === c.valor}
            onClick={() => setCategoria(c.valor)}
            className={`min-h-11 cursor-pointer rounded-full border px-3 text-sm font-semibold ${categoria === c.valor ? OPCAO_ATIVA : OPCAO}`}
          >
            {c.rotulo}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
        <BotaoIcone
          ativo={icone === ""}
          rotulo="Iniciais do nome"
          aoEscolher={() => aoEscolher("")}
        >
          <span aria-hidden="true" className="text-base font-bold">
            Aa
          </span>
        </BotaoIcone>
        {legado && (
          <BotaoIcone
            ativo
            rotulo={`${rotuloIconePerfil(icone)} (ícone atual)`}
            aoEscolher={() => aoEscolher(icone)}
          >
            <Avatar nome={nome} cor={cor} icone={icone} className="size-9 text-xl" />
          </BotaoIcone>
        )}
        {opcoes.map((o) => (
          <BotaoIcone
            key={o.valor}
            ativo={icone === o.valor}
            rotulo={o.rotulo}
            aoEscolher={() => aoEscolher(o.valor)}
          >
            <Avatar nome={o.rotulo} cor={cor} icone={o.valor} className="size-9 text-xl" />
          </BotaoIcone>
        ))}
      </div>
      <p className="mt-2 mb-0 text-sm text-muted">
        Toque numa figura para escolher; você também pode usar as iniciais do nome.
      </p>
    </fieldset>
  );
}

function BotaoIcone({
  ativo,
  rotulo,
  aoEscolher,
  children,
}: {
  ativo: boolean;
  rotulo: string;
  aoEscolher: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={rotulo}
      title={rotulo}
      onClick={aoEscolher}
      className={`grid aspect-square min-h-11 cursor-pointer place-items-center rounded-xl border p-1 ${ativo ? OPCAO_ATIVA : OPCAO}`}
    >
      {children}
    </button>
  );
}
