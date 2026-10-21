import { expect, test } from "@playwright/test";

test.describe("login", () => {
  test("não tem login social nem pedido de acesso", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /google/i })).toHaveCount(0);
    await expect(page.getByText(/receber link/i)).toHaveCount(0);
    await expect(page.getByText(/peça um convite pra quem modera/i)).toBeVisible();
  });

  test("mostra erro ao lado do campo, foca nele e não apaga o que foi digitado", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    const email = page.getByLabel("Seu email");
    await expect(page.getByRole("alert").filter({ hasText: "Digite seu email" })).toBeVisible();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toBeFocused();

    await email.fill("lucas@gmail.com");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    const senha = page.getByLabel("Senha", { exact: true });
    await expect(page.getByRole("alert").filter({ hasText: "Digite sua senha" })).toBeVisible();
    await expect(senha).toBeFocused();
    await expect(email).toHaveValue("lucas@gmail.com");
  });

  test("botão mostra e esconde a senha", async ({ page }) => {
    await page.goto("/login");
    const senha = page.getByLabel("Senha", { exact: true });
    await senha.fill("segredo123");
    await expect(senha).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Mostrar senha" }).click();
    await expect(senha).toHaveAttribute("type", "text");
  });

  test("esqueci minha senha leva ao formulário", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Esqueci minha senha" }).click();
    await expect(page).toHaveURL(/\/esqueci-senha$/);
    await expect(page).toHaveTitle("Esqueci minha senha · Uni-vos");
  });

  test("avisa quando a pessoa saiu da conta", async ({ page }) => {
    await page.goto("/login?saiu=1");
    await expect(page.getByText("Você saiu da conta.")).toBeVisible();
  });

  test("convite inválido diz o que fazer", async ({ page }) => {
    await page.goto("/convite/0000000000000000");
    await expect(page.getByRole("heading", { name: "Convite inválido" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ir para o login" })).toBeVisible();
  });
});
