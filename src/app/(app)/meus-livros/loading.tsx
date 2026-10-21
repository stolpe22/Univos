import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <PageSkeleton titulo="Meus livros" cartoes={3} colunas={1} />;
}
