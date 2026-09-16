# Evidências

## Login Tradicional e Segurança de Auth
**Trio:** Ian, Arthur, Danilo

**Por que a melhoria foi relevante?** 
Implementamos a autenticação tradicional (E-mail e Senha) para acabar com a dependência exclusiva de contas do Google. Isso democratizou o acesso à plataforma para usuários corporativos e outros provedores. Ao mesmo tempo, corrigimos brechas críticas de segurança: fechamos o roteamento administrativo que estava exposto, implementamos o encerramento real da sessão via backend (Logout API) e arrumamos o sistema de privilégios (`is_staff`).

**Evidências (Pull Requests):**
- [Frontend PR #2](https://github.com/Shio-Enterprise/frontend/pull/2)
- [Backend PR #2](https://github.com/Shio-Enterprise/backend/pull/2)

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

![Diff do reconhecimento de perfil administrativo](assets/evidencias-admin/01-perfil-administrativo.png)

`useGoogleAuth.js`: validação dos três indicadores administrativos antes de aceitar o login.

![Diff da validação administrativa no login Google](assets/evidencias-admin/02-validacao-google.png)

`AdminLoginPage/index.jsx`: leitura da mensagem recebida pelo redirecionamento em `location.state.error`.

![Diff do recebimento da mensagem no login](assets/evidencias-admin/03-mensagem-login.png)

`DashboardPage/index.jsx`: envio de mensagens distintas para respostas `401` (sessão expirada) e `403` (acesso negado).

![Diff do tratamento dos erros do dashboard](assets/evidencias-admin/04-erros-dashboard.png)

## Promessas comerciais sem suporte no backend
**Trio:** Ian, Arthur e Danilo

**Por que a melhoria foi relevante?**
Seis promessas da UI não tinham suporte real no backend (levantado na [issue #18](https://github.com/Shio-Enterprise/Documentacao/issues/18), decisão do cliente na [issue #19](https://github.com/Shio-Enterprise/Documentacao/issues/19#issuecomment-5618776911)). Implementamos o desconto automático de boas-vindas (10% na primeira compra), a newsletter real com consentimento LGPD, corrigimos os selos de pagamento para refletir o gateway real (InfinitePay: Pix, Cartão, Boleto) e removemos promessas falsas: links de termos/privacidade quebrados, estrelas de avaliação fixas (mockadas) e a promessa de e-mail de confirmação que nunca era enviado.

**Evidências (Pull Requests):**
- [Frontend PR #4](https://github.com/Shio-Enterprise/frontend/pull/4)
- [Backend PR #3](https://github.com/Shio-Enterprise/backend/pull/3)

**Evidências (prints):**

Banner de boas-vindas atualizado para 10%:

![Banner 10% de desconto](assets/evidencias-o9/01-banner-10.jpg)

Rodapé: newsletter com consentimento LGPD e selos Pix/Cartão/Boleto:

![Newsletter e selos de pagamento](assets/evidencias-o9/02-footer-newsletter-badges.jpg)

Login sem links quebrados de termos/privacidade (texto simples, sem `<Link>`):

![Login sem links de termos](assets/evidencias-o9/03-login-sem-links.jpg)

Carrinho aplicando o desconto de boas-vindas automaticamente (sem campo de cupom manual):

![Carrinho com desconto automático](assets/evidencias-o9/04-carrinho-desconto.jpg)

Card de produto sem estrelas de avaliação fixas:

![Card sem estrela](assets/evidencias-o9/05-card-sem-estrela.jpg)

## O3: Definir política e experiência de disponibilidade dos drops
**Responsável:** Matheus de Alcântara ([@matheusdealcantara](https://github.com/matheusdealcantara)) e Vilmar José Fagundes ([@VilmarFagundes](https://github.com/VilmarFagundes))

**Por que a melhoria foi relevante?**
Antes desta melhoria, a disponibilidade de um drop (campanha limitada de produtos) e a visibilidade dele no catálogo estavam misturadas na mesma flag (`is_active`), o que causava um bug de UX: um drop em Rascunho, Programado, Encerrado ou Esgotado simplesmente sumia da loja, mesmo quando o produto ainda deveria aparecer para o cliente (só sem poder ser comprado). Implementamos uma política única e centralizada que separa dois conceitos — **visível** (aparece no catálogo, depende só de `is_public`) e **vendável** (pode ser comprado, depende de `is_active`, da janela de datas e do limite de unidades `max_quantity`) — e a aplicamos de ponta a ponta: no catálogo, no carrinho e no checkout, com revalidação atômica no momento da compra para impedir concorrência (overselling) entre dois checkouts simultâneos disputando a última unidade de um drop.

**Evidências (Pull Requests):**
- [Backend PR #7](https://github.com/Shio-Enterprise/backend/pull/7)
- [Frontend PR #8](https://github.com/Shio-Enterprise/frontend/pull/8)

**Resultado:**
- Nova política única de disponibilidade (`products/availability.py`) com três níveis: `is_visible` (só depende de `is_public`), `is_open_for_sale` (ativo e dentro da janela de datas) e `is_sellable` (soma o limite `max_quantity`, contado pelas unidades já vendidas em pedidos não cancelados).
- Endpoints de catálogo (`DropCampaign` e `Product`) passaram a expor `is_visible`/`is_sellable`, para o frontend não precisar reimplementar a lógica de datas/limite em JavaScript.
- Um drop Rascunho, Programado, Encerrado ou Esgotado continua aparecendo no catálogo — só o botão de compra fica desabilitado. Apenas `is_public=False` (Privado) oculta o drop de verdade.
- Carrinho e checkout revalidam a disponibilidade no momento da ação (não confiam no estado carregado anteriormente pelo cliente), bloqueando com mensagem clara quando um item deixou de estar disponível entre a montagem do carrinho e a finalização da compra.
- Checkout trava (`select_for_update`) produtos, variações e drops envolvidos antes de checar o limite `max_quantity`, evitando que dois checkouts concorrentes ultrapassem o limite do drop — coberto por teste de concorrência real com threads.
- Admin: formulários de criação/edição de drop ganharam os campos `is_public`, `end_date`, `max_quantity` e `banner`, com validação (ex: `end_date` precisa ser posterior a `launch_date`; `max_quantity` precisa ser um inteiro positivo ou nulo).
- Área pública (catálogo, página de produto, carrinho, pagamento): itens indisponíveis aparecem com indicação visual e o botão de compra/checkout fica bloqueado até o cliente removê-los.

**Evidências (prints):**

*A inserir em `assets/evidencias-o3/` — capturas ainda pendentes.*

Catálogo mostrando produto de um drop em Rascunho (visível, mas com compra desabilitada):

![Produto de drop Rascunho visível no catálogo](assets/evidencias-03/01-catalogo-drop-rascunho.png)

Página do produto com o botão desabilitado:

![Produto desabilitado](assets/evidencias-03/produto_indisponivel.png)

Admin: formulário de criação de drop com os novos campos (visibilidade, data de encerramento, limite de unidades, banner):

![Formulário de criação de drop](assets/evidencias-03/02-admin-novo-drop.png)

Admin: lista de drops com os status calculados (Rascunho, Programado, Ativo, Encerrado, Esgotado):

![Lista de drops com status](assets/evidencias-03/03-admin-status-drops.png)

