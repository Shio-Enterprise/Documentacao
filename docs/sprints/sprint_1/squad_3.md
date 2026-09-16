## Login Tradicional e Segurança de Auth
**Trio:** Ian, Arthur, Danilo

**Por que a melhoria foi relevante?** 

**Ganho de Negócio:** A implementação da autenticação tradicional (E-mail e Senha) eliminou a dependência exclusiva de contas do Google. Isso foi vital para democratizar o acesso à plataforma, abrindo portas para clientes corporativos (B2B) e usuários que preferem não vincular contas pessoais, o que remove atritos e melhora a taxa de conversão no cadastro e checkout.

**Segurança e Prevenção de Ataques:** Corrigimos uma vulnerabilidade crítica de *Token Replay/Hijacking* no ciclo de vida do JWT. Anteriormente, se um invasor roubasse um *refresh token* válido (ex: via ataque XSS ou interceptação local), ele poderia utilizá-lo indefinidamente para gerar novos acessos à API, mantendo o controle da conta mesmo após o usuário tentar deslogar. Com a nossa implementação de *blacklist* no `TokenRefreshView`, o token antigo é destruído imediatamente no banco de dados e rotacionado a cada uso. Além disso, a validação de privilégios administrativos no front-end era falha, checando apenas `is_staff`. Com o mapeamento correto de `is_admin` e `is_superuser`, blindamos o acesso ao painel contra usuários com permissões mal configuradas.

**Evidências (Pull Requests):**
- [Frontend PR #2](https://github.com/Shio-Enterprise/frontend/pull/2)
- [Backend PR #2](https://github.com/Shio-Enterprise/backend/pull/2)

**Evidências (Prints):**

Nova interface de Login e Cadastro utilizando e-mail e senha:

![Formulário de Login Tradicional](../../assets/evidencias-04/01-login-tradicional.jpg)

Diff do backend evidenciando a invalidação do JWT antigo e rotação do Refresh Token na renovação:

![Blacklist de Refresh Token JWT](../../assets/evidencias-04/02-jwt-blacklist.png)

Diff do frontend (`AuthContext`) exibindo a checagem rigorosa de privilégios administrativos:

![Validação Administrativa Reforçada](../../assets/evidencias-04/03-auth-context-admin.png)

### Correção complementar de acesso ao painel administrativo

**Responsável:** Matheus de Alcântara

**Origem:** [Issue #20 — Corrigir acesso ao painel administrativo](https://github.com/Shio-Enterprise/Documentacao/issues/20)

**Problema corrigido:**
O frontend reconhecia o perfil administrativo de forma incompleta, priorizando apenas `is_staff`. Isso podia impedir o acesso de uma conta administrativa válida quando a API a identificava por `is_admin` ou `is_superuser`. Além disso, o redirecionamento do dashboard para o login não preservava o motivo da falha.

**Resultado:**
- A sessão armazenada e novas autenticações passaram a reconhecer `is_admin`, `is_staff` e `is_superuser`.
- O login com Google passou a aplicar a mesma regra antes de liberar o painel.
- Respostas `401` limpam a sessão e informam que ela expirou.
- Respostas `403` informam que a conta não possui permissão administrativa.
- A tela de login administrativo exibe a mensagem recebida pelo redirecionamento.

**Evidências:**
- [Frontend PR #1](https://github.com/Shio-Enterprise/frontend/pull/1)
- Commit `fb6a47b` — `fix(painel-admin): mapeia validação de administrador`
- Validação registrada na PR: `npm run build` concluído com sucesso.

**Evidências das alterações no código:**

Capturas do [diff da PR #1](https://github.com/Shio-Enterprise/frontend/pull/1/files), referente ao commit `fb6a47b`. Linhas vermelhas mostram o código removido; linhas verdes mostram o código adicionado.

`AuthContext.jsx`: reconhecimento de `is_admin`, `is_staff` e `is_superuser` ao restaurar a sessão.

![Diff do reconhecimento de perfil administrativo](../../assets/evidencias-admin/01-perfil-administrativo.png)

`useGoogleAuth.js`: validação dos três indicadores administrativos antes de aceitar o login.

![Diff da validação administrativa no login Google](../../assets/evidencias-admin/02-validacao-google.png)

`AdminLoginPage/index.jsx`: leitura da mensagem recebida pelo redirecionamento em `location.state.error`.

![Diff do recebimento da mensagem no login](../../assets/evidencias-admin/03-mensagem-login.png)

`DashboardPage/index.jsx`: envio de mensagens distintas para respostas `401` (sessão expirada) e `403` (acesso negado).

![Diff do tratamento dos erros do dashboard](../../assets/evidencias-admin/04-erros-dashboard.png)

## Promessas comerciais sem suporte no backend
**Trio:** Ian, Arthur e Danilo

**Por que a melhoria foi relevante?**
Seis promessas da UI não tinham suporte real no backend (levantado na [issue #18](https://github.com/Shio-Enterprise/Documentacao/issues/18), decisão do cliente na [issue #19](https://github.com/Shio-Enterprise/Documentacao/issues/19#issuecomment-5618776911)). Implementamos o desconto automático de boas-vindas (10% na primeira compra), a newsletter real com consentimento LGPD, corrigimos os selos de pagamento para refletir o gateway real (InfinitePay: Pix, Cartão, Boleto) e removemos promessas falsas: links de termos/privacidade quebrados, estrelas de avaliação fixas (mockadas) e a promessa de e-mail de confirmação que nunca era enviado.

**Evidências (Pull Requests):**
- [Frontend PR #4](https://github.com/Shio-Enterprise/frontend/pull/4)
- [Backend PR #3](https://github.com/Shio-Enterprise/backend/pull/3)

**Evidências (prints):**

Banner de boas-vindas atualizado para 10%:

![Banner 10% de desconto](../../assets/evidencias-o9/01-banner-10.jpg)

Rodapé: newsletter com consentimento LGPD e selos Pix/Cartão/Boleto:

![Newsletter e selos de pagamento](../../assets/evidencias-o9/02-footer-newsletter-badges.jpg)

Login sem links quebrados de termos/privacidade (texto simples, sem `<Link>`):

![Login sem links de termos](../../assets/evidencias-o9/03-login-sem-links.jpg)

Carrinho aplicando o desconto de boas-vindas automaticamente (sem campo de cupom manual):

![Carrinho com desconto automático](../../assets/evidencias-o9/04-carrinho-desconto.jpg)

Card de produto sem estrelas de avaliação fixas:

![Card sem estrela](../../assets/evidencias-o9/05-card-sem-estrela.jpg)