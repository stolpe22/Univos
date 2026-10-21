import { PageSkeleton } from "@/components/ui/PageSkeleton";
export default function Loading() {
  return <PageSkeleton titulo="Livro da vez" cartoes={3} colunas={2} />;
}
