import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import type { CorPerfil } from "@/components/ui/Avatar";
import { ToastProvider } from "@/components/ui/Toast";
import { getClubeAtual } from "@/features/clube/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login");

  const [{ data: perfil }, clube] = await Promise.all([
    supabase.from("perfis").select("nome, cor").eq("id", claims.sub).maybeSingle(),
    getClubeAtual(),
  ]);

  // Logou mas ainda não está em nenhum grupo: só entra por convite.
  if (!clube) redirect("/boas-vindas");

  const usuario = {
    nome: (perfil?.nome as string | undefined) ?? String(claims.email ?? "").split("@")[0],
    cor: ((perfil?.cor as CorPerfil | undefined) ?? "purple") satisfies CorPerfil,
  };

  return (
    <ToastProvider>
      <AppShell
        usuario={usuario}
        grupo={{ id: clube.id, nome: clube.nome }}
        grupos={clube.grupos}
        dono={clube.dono}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
