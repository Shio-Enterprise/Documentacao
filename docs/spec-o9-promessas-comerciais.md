# Spec — O9: Promessas comerciais sem suporte no backend

**Status:** aprovada pelo cliente em reunião (ver decisão publicada em [issue #19](https://github.com/Shio-Enterprise/Documentacao/issues/19#issuecomment-5618776911)).
**Issue técnica:** [#18](https://github.com/Shio-Enterprise/Documentacao/issues/18)
**Repos afetados:** `frontend` (branch `O9-promessas-comerciais`), `backend` (branch `O9-promessas-comerciais`).

## Escopo

Seis promessas de UI hoje não têm suporte real no backend. Para cada uma, a decisão do cliente e o que precisa mudar:

| # | Item | Decisão |
|---|------|---------|
| 1 | Banner "cadastre-se e ganhe 20%" | Implementar de verdade, 10% |
| 2 | Newsletter (rodapé) | Implementar de verdade, com consentimento LGPD |
| 3 | Selos de pagamento (rodapé) | Ajustar para refletir InfinitePay (Pix, cartão, boleto) |
| 4 | Links termos de uso / privacidade | Remover por enquanto |
| 5 | Estrelas de avaliação fixas | Remover da UI (feature de review vira issue própria) |
| 6 | Promessa de e-mail de confirmação (PixPage) | Remover — não implementar e-mail transacional nesta entrega |

Fora de escopo (explicitamente adiado):
- Painel admin para gerenciar descontos dinamicamente (ideia aprovada pelo cliente, mas fica pra depois).
- Entrada manual de código de cupom pelo usuário — o desconto de boas-vindas é aplicado automaticamente, sem o usuário digitar código.
- Conteúdo jurídico real de termos/privacidade (aguardando texto do cliente).
- Sistema de avaliação de produto por estrelas (model, endpoints, UI de review) — vira issue separada.
- Envio de e-mail transacional (qualquer tipo).

---

## Item 1 — Desconto de boas-vindas (10%, primeira compra)

### Contexto técnico

O backend já tem a modelagem pronta e sem uso:
- `orders.Coupon` (`backend/orders/models.py:29`): `code`, `discount_type` (`PERCENTAGE`/`FIXED_VALUE`), `discount_value`, `expiration_date`, `is_active`.
- `orders.CustomerOrder` (`backend/orders/models.py:71`): já tem `coupon` (FK nullable) e `discount_amount` (default 0), nunca preenchidos.
- `CheckoutAPIView.post` (`backend/orders/views.py:362`) hoje calcula `total_amount = subtotal + shipping_cost` sem considerar desconto algum.

### Regra de negócio

Desconto automático de 10% sobre o subtotal, aplicado **apenas se o usuário autenticado nunca teve nenhum `CustomerOrder`** (qualquer status). Não depende de código digitado — é automático, decidido no servidor (nunca confiar em flag vinda do frontend).

### Mudanças — backend

1. **Seed do cupom.** Criar via data migration em `orders/migrations/` um `Coupon` singleton:
   - `code="BEMVINDO10"`, `discount_type="PERCENTAGE"`, `discount_value=10`, `is_active=True`, `expiration_date=None`.
   - Usar `get_or_create` na migration para ser idempotente em re-execução.

2. **`CheckoutAPIView.post`** (`backend/orders/views.py:362`): antes de criar o `CustomerOrder`, checar elegibilidade:
   ```python
   is_first_order = not CustomerOrder.objects.filter(user=user).exists()
   welcome_coupon = Coupon.objects.filter(code="BEMVINDO10", is_active=True).first() if is_first_order else None
   discount_amount = (subtotal * Decimal("0.10")).quantize(Decimal("0.01")) if welcome_coupon else Decimal("0.00")
   total_amount = float(subtotal) - float(discount_amount) + float(shipping_cost)
   ```
   Passar `coupon=welcome_coupon, discount_amount=discount_amount` na criação do `CustomerOrder`.

3. **Serializer de pedido** (`backend/orders/serializers.py:106`, campo `discount_amount` já existe): confirmar que aparece na resposta do checkout e do detalhe do pedido (`UserOrderDetailView`) — hoje o campo existe no serializer mas ninguém popula o valor.

### Mudanças — frontend

1. **`Navbar.jsx:30`** — trocar texto do banner de "20%" para "10%".
2. **`CartPage`** (`frontend/src/pages/public/CartPage/index.jsx`) — resumo do carrinho precisa exibir linha de desconto quando aplicável, buscando `eligible_for_welcome_discount`/`welcome_discount_amount` do `GET /api/orders/cart/` (ver mudança de backend abaixo).
3. **`PixPage`** (linha da seção "Order card", `frontend/src/pages/public/PixPage/index.jsx:147` em diante) — exibir `discount_amount` retornado pelo pedido, se `> 0`.
4. **Campo "Código promocional" morto** (`CartPage/index.jsx:157-163`, input + botão "Aplicar" sem `onChange`/handler nenhum — achado durante o levantamento, é o "cupom sem ação real" citado na issue #18/#19, distinto do banner). Decisão do cliente: **remover** esse bloco — o desconto é automático, não por código digitado.

### Testes mínimos
- Primeira compra do usuário: `discount_amount == subtotal * 0.10`, `coupon` setado.
- Segunda compra do mesmo usuário: `discount_amount == 0`, `coupon` nulo.
- Dois checkouts concorrentes do mesmo usuário (nunca comprou antes) não podem ambos aplicar o desconto — cobrir com `transaction.atomic` + `select_for_update` na checagem de "primeira compra" ou teste de corrida documentando o comportamento aceito.

---

## Item 2 — Newsletter real (com consentimento LGPD)

### Contexto técnico

`NewsletterBand` (`frontend/src/components/ui/ShioDesign.jsx:100`) hoje só seta `status='success'` local, sem nenhuma chamada de rede. Backend não tem model nenhum pra isso (confirmado, nenhuma ocorrência de "newsletter" em `orders`, `products`, `authentication`, `core`).

### Mudanças — backend

1. **Model novo em `authentication/models.py`** (app escolhido por já concentrar dados pessoais/consentimento, ex.: `Address`):
   ```python
   class NewsletterSubscriber(models.Model):
       id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
       email = models.EmailField(unique=True)
       consent_lgpd = models.BooleanField(default=False)
       subscribed_at = models.DateTimeField(auto_now_add=True)
       unsubscribed_at = models.DateTimeField(null=True, blank=True)
   ```
2. **Endpoint público** `POST /api/auth/newsletter/subscribe/` (sem autenticação):
   - Body: `{"email": str, "consent_lgpd": bool}`.
   - Validação: email válido, `consent_lgpd` deve ser `true` (senão `400`, mensagem "Consentimento obrigatório").
   - Idempotente: se o e-mail já existe e `consent_lgpd=True`, retornar `200` sem duplicar (não é erro re-inscrever).
   - Registrar em `authentication/admin.py` para o time conseguir ver/exportar a lista.

### Mudanças — frontend

1. **`ShioDesign.jsx` `NewsletterBand`** (linha 100): adicionar checkbox de consentimento explícito (texto tipo "Aceito receber comunicações da Shio por e-mail, conforme a Política de Privacidade"), desabilitar submit até marcado, trocar `setStatus('success')` fake por chamada real via `apiClient.post('/auth/newsletter/subscribe/', { email, consent_lgpd })` (`frontend/src/lib/axios.js`), tratando erro de validação (mostrar mensagem do backend).

### Testes mínimos
- Assinatura válida com consentimento → `201`, registro criado.
- Sem consentimento → `400`, nada persistido.
- E-mail duplicado com consentimento → `200`, sem duplicar linha.

---

## Item 3 — Selos de forma de pagamento

Frontend only. `Footer.jsx` `PaymentBadges` (`frontend/src/components/layout/shared/Footer.jsx:44`): remover badges de Visa/Mastercard/PayPal/Apple Pay/Google Pay, substituir por três badges: **Pix**, **Cartão** e **Boleto** (métodos reais do InfinitePay, confirmado em `PaymentMethod` no backend — `backend/orders/models.py:16`).

### Testes mínimos
- Nenhum automatizado necessário — conferência visual.

---

## Item 4 — Remover links de termos/privacidade

Frontend only, sem rota `/termos` ou `/privacidade` cadastrada em `frontend/src/routes/index.jsx` (confirmado).

1. **`Footer.jsx`** (`frontend/src/components/layout/shared/Footer.jsx:15-41`): remover os itens `Política de privacidade` (coluna "Ajuda") e `Termos de uso` (coluna "Redes sociais") do array `columns`.
2. **`LoginPage`** (`frontend/src/pages/user/LoginPage/index.jsx:80`): hoje linka para `/termos` e `/privacidade`, rotas inexistentes (tela em branco, pior que o caso do rodapé). Trocar os `<Link>` por texto simples, igual já é feito em `SignUpPage/index.jsx:90` (que só tem o texto, sem link) — mantém consistência entre as duas telas.

### Testes mínimos
- Cobrir que o rodapé não renderiza nenhum link para `/termos` ou `/privacidade`.

---

## Item 5 — Remover estrelas de avaliação fixas

### Contexto técnico

`Rating` (`frontend/src/components/ui/ShioDesign.jsx:46`) sempre renderiza `★★★★★` fixo, ignorando a prop `value` — que aliás sempre chega `null` (`rating: null` tanto em `CategoryPage/index.jsx:19` quanto em `ProductDetailPage/index.jsx:15`, dado mockado nunca populado). Sem model de review no backend (confirmado, nenhuma ocorrência de "review"/"rating" em `products`). Usado em `ProductCard` (`ShioDesign.jsx:68`), que aparece em `HomePage` e `CategoryPage`.

### Mudança — frontend

Em `ProductCard` (`ShioDesign.jsx:55-79`), remover o bloco `<Rating value={product.rating} />` (linhas 67-69). Não substituir por nada por enquanto — feature de avaliação real vira issue própria (model, endpoints, UI), incluindo lá a decisão de trazer `Rating` de volta quando houver dado real.

### Testes mínimos
- Cobrir que `ProductCard` não renderiza nenhum elemento de estrela/rating.

---

## Item 6 — Remover promessa de e-mail de confirmação

Frontend only. `PixPage` (`frontend/src/pages/public/PixPage/index.jsx:142`): texto "Enviamos os detalhes da sua compra para o seu e-mail." afirma um evento que nunca acontece (backend não envia e-mail nenhum, confirmado — zero ocorrência de `send_mail`/`EmailMessage` no projeto). Substituir por mensagem que não promete isso, ex.: "Guarde o número do pedido para acompanhar o status em Meus Pedidos."

### Testes mínimos
- Cobrir que a tela de confirmação não menciona envio de e-mail.

---

## Resumo de arquivos tocados

**backend**
- `orders/models.py` — sem mudança de schema (campos já existem).
- `orders/migrations/000X_seed_welcome_coupon.py` — novo (data migration).
- `orders/views.py` — `CheckoutAPIView.post`.
- `authentication/models.py` — novo model `NewsletterSubscriber`.
- `authentication/migrations/000X_newslettersubscriber.py` — novo.
- `authentication/serializers.py`, `authentication/views.py`, `authentication/urls.py` — endpoint de inscrição.
- `authentication/admin.py` — registro do novo model.

**frontend**
- `src/components/layout/public/Navbar.jsx` — texto do banner.
- `src/pages/public/CartPage/index.jsx` — exibir desconto.
- `src/pages/public/PixPage/index.jsx` — exibir desconto + remover texto de e-mail.
- `src/components/ui/ShioDesign.jsx` — `NewsletterBand` (chamada real + consentimento), `ProductCard` (remover `Rating`).
- `src/components/layout/shared/Footer.jsx` — badges de pagamento, remoção de links termos/privacidade.
- `src/pages/user/LoginPage/index.jsx` — remoção de links termos/privacidade.

## Não-objetivos (evitar scope creep)
- Não criar UI de "aplicar cupom manualmente".
- Não criar painel admin de descontos nesta entrega.
- Não criar app Django novo só para a newsletter — reaproveitar `authentication`.
- Não tocar em `SignUpPage` (já está no formato correto, sem link quebrado).
