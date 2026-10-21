import type { ReactNode } from "react";
import { Pill } from "@/components/ui/Card";
export function Moldura({
  children,
  titulo = "Enquete do debate",
}: {
  children: ReactNode;
  titulo?: string;
}) {
  return (
    <section className="rounded-xl border border-line bg-bg p-3">
      <p className="mt-0 mb-1.5">
        <Pill>{titulo}</Pill>
      </p>
      {children}
    </section>
  );
}
