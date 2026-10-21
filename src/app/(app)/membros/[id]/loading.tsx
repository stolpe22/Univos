import { PageSkeleton } from "@/components/ui/PageSkeleton";
export default function Loading() {
  return <PageSkeleton titulo="o perfil do membro" cartoes={3} colunas={2} />;
}
