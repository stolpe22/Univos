---
name: mobile-check
description: Testa uma tela do Uni-vos no celular (390x844) com Playwright, checando toque, fonte, rolagem e fluxo principal. Use depois de mudar uma tela ou quando o usuário pedir para testar no mobile.
argument-hint: "[modulo]"
context: fork
agent: mobile-qa
background: false
---

Teste **$ARGUMENTS** no projeto `mobile` do Playwright.

Além do fluxo principal, rode este script na página e reporte o resultado:

```js
const pequenos = [...document.querySelectorAll('button, a, input, select, textarea, [role=button]')]
  .filter(el => { const r = el.getBoundingClientRect(); return r.width && r.height && (r.width < 44 || r.height < 44); })
  .map(el => (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30));
const abaixoWcag = [...document.querySelectorAll('button, a, input, select, textarea, [role=button]')]
  .filter(el => { const r = el.getBoundingClientRect(); return r.width && r.height && (r.width < 24 || r.height < 24); }).length;
const fontePequena = [...document.querySelectorAll('input, select, textarea')]
  .filter(el => parseFloat(getComputedStyle(el).fontSize) < 16).length;
({ pequenos, abaixoWcag, fontePequena, rolagemHorizontal: document.documentElement.scrollWidth > innerWidth });
```

Repita em 360×800 e em paisagem, foque cada campo para conferir que a barra inferior não o cobre, e inclua screenshots da tela inicial, de um erro de validação e do toast com Desfazer.
