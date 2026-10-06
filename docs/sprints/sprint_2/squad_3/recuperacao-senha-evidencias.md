## Recuperação de senha por e-mail
**Trio:** Ian, Arthur e Danilo

**Origem:**
- [Issue #34](https://github.com/Shio-Enterprise/Documentacao/issues/34) — recuperação de senha por e-mail.
- [Issue #39](https://github.com/Shio-Enterprise/Documentacao/issues/39) — backend do fluxo de redefinição de senha.
- [Issue #40](https://github.com/Shio-Enterprise/Documentacao/issues/40) — telas de Esqueci a Senha e Redefinir Senha.

**Por que a melhoria foi relevante?**
A plataforma não tinha forma de recuperar a senha: um cliente que a esquecesse perdia acesso ao histórico de pedidos, endereços e rastreamento. O fluxo depende da base de envio de e-mails entregue na [#35](./envio-emails-evidencias.md).

**Escopo:**
- `POST /api/auth/password-reset/`: recebe o e-mail e envia o link de redefinição usando o app `notifications`.
- `POST /api/auth/password-reset-confirm/`: recebe o token e a nova senha, valida e atualiza a senha.
- Telas de "Esqueci minha senha" e de definição da nova senha no frontend.

**Evidências (Pull Requests):**
- [Backend PR #16](https://github.com/Shio-Enterprise/backend/pull/16) — em revisão
- [Frontend PR #14](https://github.com/Shio-Enterprise/frontend/pull/14) — em revisão

**Evidências (prints):**

_A adicionar._
