import { NextResponse, type NextRequest } from "next/server";
import { destinoSeguro } from "@/features/auth/schemas";
import { codigoDoDestino } from "@/features/clube/schemas";
import { createClient } from "@/lib/supabase/server";

/**
 * Volta dos links que o Supabase manda por email: confirmação da conta criada pelo
 * convite e "Esqueci minha senha". Troca o código por uma sessão.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const destino = destinoSeguro(searchParams.get("voltar"));

  if (!code) return NextResponse.redirect(`${origin}/login?erro=link`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?erro=link`);

  // Confirmou a conta criada pelo convite: já entra no grupo.
  const codigo = codigoDoDestino(destino);
  if (codigo) {
    const { data: grupo } = await supabase.rpc("entrar_no_clube", { codigo });
    if (grupo) {
      const resposta = NextResponse.redirect(`${origin}/inicio`);
      resposta.cookies.set("univos_grupo", String(grupo), { path: "/", sameSite: "lax" });
      return resposta;
    }
  }

  return NextResponse.redirect(`${origin}${destino}`);
}
