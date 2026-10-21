import type { Metadata } from "next";
import Link from "next/link";
import { Aviso, TelaEntrada } from "@/components/layout/TelaEntrada";
import { Button, classesBotao } from "@/components/ui/Button";
import { aceitarConvite } from "@/features/clube/actions";
import { nomeDoConvite } from "@/features/clube/queries";
import { getUsuario } from "@/lib/supabase/server";
import { CadastroConviteForm } from "./CadastroConviteForm";

export const metadata: Metadata = {
  title: "Convite",
  // O link de convite costuma ser mandado no WhatsApp: a prévia diz do que se trata.
  openGraph: {
    title: "Te chamaram pro Uni-vos",
    description: "Um convite pra um grupo de livros e debates. Toque pra criar sua conta e entrar.",
  },
};

export default async function ConvitePage({
  params,
  searchParams,
}: PageProps<"/convite/[codigo]">) {
  const { codigo } = await params;
  const { erro } = await searchParams;
  const [nome, usuario] = await Promise.all([nomeDoConvite(codigo), getUsuario()]);

  if (!nome) {
    return (
      <TelaEntrada>
        <h1 className="mt-0 mb-2 text-center text-2xl font-bold">Convite inválido</h1>
        <p className="mt-0 mb-4 text-center text-muted">
          Esse convite não vale mais. Peça um link novo pra quem modera o grupo.
        </p>
        <Link href="/login" className={`${classesBotao("ghost")} w-full`}>
          Ir para o login
        </Link>
      </TelaEntrada>
    );
  }

  return (
    <TelaEntrada>
      <h1 className="mt-0 mb-2 text-center text-2xl font-bold">Te chamaram pro grupo {nome}</h1>
      <p className="mt-0 mb-4 text-center text-muted">
        Livros, debates e um mapa político pra puxar conversa.
      </p>
      {erro && (
        <div className="mb-3">
          <Aviso tipo="alerta">
            Não deu pra entrar agora. Confira sua internet e tente de novo.
          </Aviso>
        </div>
      )}
      {usuario ? (
        <form action={aceitarConvite.bind(null, codigo)} className="grid">
          <Button type="submit">Entrar no grupo</Button>
        </form>
      ) : (
        <CadastroConviteForm codigo={codigo} />
      )}
    </TelaEntrada>
  );
}
