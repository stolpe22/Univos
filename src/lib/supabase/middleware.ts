import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { destinoSeguro } from "@/features/auth/schemas";
import type { Database } from "@/lib/database.types";

/** Rotas que não exigem login. */
const PUBLICAS = [
  "/login",
  "/auth",
  "/convite",
  "/esqueci-senha",
  // imagens geradas: o WhatsApp e o navegador buscam sem estar logados
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
];

/**
 * Renova a sessão do Supabase a cada requisição e manda quem não está logado
 * para /login. Chamado pelo src/proxy.ts.
 */
export async function atualizarSessao(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
        },
      },
    },
  );

  // Não coloque código entre createServerClient e getClaims: é o que renova a sessão.
  const { data } = await supabase.auth.getClaims();
  const logado = !!data?.claims;
  const { pathname } = request.nextUrl;
  const publica = PUBLICAS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Redireciona levando junto os cookies de sessão renovados.
  const redirecionar = (pathnameDestino: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = pathnameDestino;
    url.search = search;
    const destino = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => destino.cookies.set(c));
    return destino;
  };

  if (!logado && !publica) {
    return redirecionar("/login", pathname === "/" ? "" : `?voltar=${encodeURIComponent(pathname)}`);
  }

  if (logado && (pathname === "/" || pathname === "/login")) {
    const [caminho, busca] = destinoSeguro(request.nextUrl.searchParams.get("voltar")).split("?");
    return redirecionar(caminho, busca ? `?${busca}` : "");
  }

  return response;
}
