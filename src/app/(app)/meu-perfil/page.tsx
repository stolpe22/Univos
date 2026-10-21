import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PageHead } from "@/components/ui/PageHead";
import { type CorPerfil, type IconePerfil } from "@/components/ui/Avatar";
import { AvatarPerfilForm, NomePerfilForm, SenhaPerfilForm } from "@/features/perfil/PerfilForms";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function MeuPerfilPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) notFound();

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, cor, icone_avatar")
    .eq("id", userId)
    .maybeSingle();
  if (!perfil) notFound();

  return (
    <>
      <PageHead
        titulo="Meu perfil"
        ajuda="meu-perfil"
        descricao="Personalize seu nome e avatar, ou atualize sua senha de acesso."
      />
      <div className="grid gap-3.5 md:grid-cols-2">
        <Card titulo="Seu avatar">
          <p className="mt-0 mb-3 text-sm text-muted">
            Escolha uma cor e use suas iniciais ou um ícone para aparecer nos debates e nas
            conversas.
          </p>
          <AvatarPerfilForm
            nome={perfil.nome}
            corInicial={(perfil.cor as CorPerfil | null) ?? "purple"}
            iconeInicial={(perfil.icone_avatar as IconePerfil | "" | null) ?? ""}
          />
        </Card>
        <Card titulo="Nome exibido">
          <p className="mt-0 mb-3 text-sm text-muted">
            Esse nome aparece nos comentários, nas votações e na lista de pessoas.
          </p>
          <NomePerfilForm nome={perfil.nome} />
        </Card>
        <Card titulo="Senha de acesso">
          <p className="mt-0 mb-3 text-sm text-muted">
            A senha nova precisa ter pelo menos 8 caracteres. Você continuará conectado neste
            aparelho.
          </p>
          <SenhaPerfilForm />
        </Card>
      </div>
    </>
  );
}
