import { expect, test, type Page } from "@playwright/test";

/**
 * Regras de mobile e Nielsen que valem para toda rota.
 * Sem sessão, só a tela de login é testada; as rotas logadas entram quando
 * houver usuário de teste (variáveis E2E_*), junto com /nova-feature login.
 */
const PUBLICAS = [
  { path: "/login", titulo: "Entrar" },
  { path: "/convite/0000000000000000", titulo: "Convite" },
  { path: "/esqueci-senha", titulo: "Esqueci minha senha" },
];

async function checarRegrasBase(page: Page, titulo: string) {
  // Título "<Aba> · Uni-vos" (heurística 1)
  await expect(page).toHaveTitle(`${titulo} · Uni-vos`);

  // Sem rolagem horizontal
  const larguraExtra = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(larguraExtra, "rolagem horizontal").toBeLessThanOrEqual(0);

  // Alvos de toque ≥ 44×44 px
  const pequenos = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, summary")]
      .filter((el) => el.offsetParent !== null && !el.closest(".sr-only"))
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      // arredonda: subpixel (43,99) não é alvo pequeno
      .filter(({ r }) => Math.round(r.width) < 44 || Math.round(r.height) < 44)
      .map(
        ({ el, r }) =>
          `${el.tagName} "${el.textContent?.trim()}" ${Math.round(r.width)}×${Math.round(r.height)}`,
      ),
  );
  expect(pequenos, "alvos de toque menores que 44 px").toEqual([]);

  // Inputs ≥ 16 px (evita zoom no iOS)
  const fontesPequenas = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("input, select, textarea")]
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => el.id || el.getAttribute("name") || el.tagName),
  );
  expect(fontesPequenas, "inputs com fonte menor que 16 px").toEqual([]);

  // Zoom nunca bloqueado (WCAG 1.4.4)
  const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
  expect(viewport).not.toMatch(/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\D|$)/);
}

for (const rota of PUBLICAS) {
  test(`${rota.path} segue as regras base de UX`, async ({ page }) => {
    await page.goto(rota.path);
    await checarRegrasBase(page, rota.titulo);
  });
}

test("rota logada sem sessão leva ao login", async ({ page }) => {
  await page.goto("/livro");
  await expect(page).toHaveURL(/\/login\?voltar=%2Flivro/);
});
