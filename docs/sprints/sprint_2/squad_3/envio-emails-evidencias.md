## Envio de e-mails transacionais
**Trio:** Ian, Arthur e Danilo

**Origem:**
- [Issue #35](https://github.com/Shio-Enterprise/Documentacao/issues/35) — configurar envio de e-mails.

**Por que a melhoria foi relevante?**
O sistema não enviava nenhum e-mail: a newsletter apenas armazenava inscritos, não havia confirmação de pedido e a recuperação de senha ([#34](https://github.com/Shio-Enterprise/Documentacao/issues/34)) não podia ser implementada. Esta entrega cria a base única de envio, reutilizada por todas essas funcionalidades.

**Decisão técnica:**
O plano Hobby do Railway bloqueia conexões SMTP de saída. Por isso, o envio foi implementado com o **Resend** via API HTTPS (`django-anymail`), em vez de SMTP.

**Regras implementadas:**
- Novo app `notifications` com a função única `send_email`, que retorna sucesso ou falha sem lançar exceção — uma falha no envio não interrompe a ação do usuário.
- Sem `RESEND_API_KEY` configurada, os e-mails são exibidos no console e um aviso é registrado na inicialização (o deploy não quebra).
- Testes não realizam envio real.
- Template base com a identidade visual da Shio, em HTML e texto simples.
- E-mails mascarados nos logs (LGPD).
- Comando `enviar_email_teste` para validar a configuração em qualquer ambiente.
- Variáveis documentadas no README e no `.env.example`.

**Evidências (Pull Requests):**
- [Backend PR #15](https://github.com/Shio-Enterprise/backend/pull/15)

**Pendências:**
- Verificar domínio próprio no Resend e validar o envio em produção.

**Evidências (prints):**

_A adicionar._
