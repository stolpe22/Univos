import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/ui/PageHead";
import { Auditoria } from "@/features/admin/Auditoria";
import { CriarGrupoForm } from "@/features/admin/CriarGrupoForm";
import { GruposLista } from "@/features/admin/GruposLista";
import { listarAuditoria, listarGruposAdmin } from "@/features/admin/queries";
import { getClubeAtual } from "@/features/clube/queries";

export const metadata: Metadata = { title: "Admin" };

/** Só o dono do sistema. Para os outros, a página não existe. */
export default async function AdminPage() {
  const clube = await getClubeAtual();
  if (!clube?.dono) notFound();

  const [grupos, eventos] = await Promise.all([listarGruposAdmin(), listarAuditoria()]);

  return (
    <>
      <PageHead
        titulo="Admin"
        descricao="Grupos, moderadores e tudo o que aconteceu nos convites."
      />
      <div className="grid gap-3.5">
        <CriarGrupoForm />
        <GruposLista grupos={grupos} grupoAtual={clube.id} />
        <Auditoria eventos={eventos} />
      </div>
    </>
  );
}
