"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Escuta mudanças no banco (Supabase Realtime) e recarrega os dados da página.
 * A RLS vale aqui também: só chegam mudanças que a pessoa pode ver.
 */
export function AoVivo({ canal, tabelas }: { canal: string; tabelas: string[] }) {
  const router = useRouter();
  const chave = tabelas.join(",");

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Junta várias mudanças seguidas num recarregamento só.
    const recarregar = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 300);
    };

    const ch = supabase.channel(canal);
    for (const tabela of chave.split(",")) {
      ch.on("postgres_changes", { event: "*", schema: "public", table: tabela }, recarregar);
    }
    ch.subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(ch);
    };
  }, [canal, chave, router]);

  return null;
}
