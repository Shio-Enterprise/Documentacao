# O9 — Promessas Comerciais Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolver as 6 promessas comerciais da UI sem suporte real (desconto de boas-vindas, newsletter, selos de pagamento, links de termos/privacidade, estrelas de avaliação fixas e promessa de e-mail de confirmação), conforme decisão do cliente.

**Architecture:** Dois repositórios (`backend` Django/DRF, `frontend` React/Vite), cada um na branch `O9-promessas-comerciais` a partir de `main`. Tarefas de backend vêm primeiro quando uma tarefa de frontend depende do contrato de API que elas expõem.

**Tech Stack:** Django REST Framework + pytest (backend); React + Vite + Vitest + Testing Library (frontend).

**Spec:** `Documentacao/docs/spec-o9-promessas-comerciais.md`

## Global Constraints

- Desconto de boas-vindas é de **10%**, automático, aplicado apenas se o usuário nunca teve nenhum `CustomerOrder` — sem entrada manual de código.
- Newsletter só persiste o e-mail se `consent_lgpd=True` for enviado explicitamente.
- Nenhum app Django novo: o model de newsletter entra em `authentication`.
- Não publicar conteúdo jurídico real de termos/privacidade nesta entrega — apenas remover os links quebrados.
- Não implementar sistema de avaliação por estrelas nesta entrega — apenas remover a estrela fixa fake.
- Não implementar envio de e-mail algum.
- Não criar UI de "aplicar cupom manualmente" — o campo existente ("Código promocional") é removido, não implementado.

## Como os testes rodam em cada repo

- **backend**: `make test` executa `pytest -v` sem filtro de path — pega qualquer teste em qualquer arquivo que bata com `python_files = ["tests.py", "test_*.py", "*_tests.py"]` (config em `pyproject.toml`). Todas as tarefas deste plano adicionam classes de teste dentro dos arquivos `tests.py` já existentes (`orders/tests.py`, `authentication/tests.py`) — nenhum arquivo novo de teste, nenhum wiring adicional necessário, `make test` cobre tudo automaticamente.
- **frontend**: **não existe Makefile nem CI configurado** neste repo (só há `.github/pull_request_template.md`, nenhum workflow). O entrypoint real de teste é o script `test` do `package.json` (Vitest): `npm test` (modo watch) ou `npm run test -- --run` (uma execução só, usado nos steps deste plano). Vitest descobre qualquer arquivo `*.test.jsx` sob `src/` automaticamente (sem config de `include` customizado em `vite.config.js`), então os arquivos de teste novos deste plano (`ShioDesign.test.jsx`, `Footer.test.jsx`, `CartPage/index.test.jsx`, `PixPage/index.test.jsx`, `CartContext.test.jsx`) são pegos sem nenhuma configuração extra.
- Rodar a suíte completa de cada repo **antes de começar** (`make test` no backend, `npm run test -- --run` no frontend) pra ter a baseline de testes já passando, e de novo ao final de cada tarefa — os steps de "rodar a suíte completa" já embutidos nas Tasks 3 (backend) e 9 e 13 (frontend) cobrem isso, mas vale rodar a suíte inteira mais uma vez no fim de todas as tarefas de cada repo.

---

## Backend (`repo: backend`, branch `O9-promessas-comerciais`)

### Task 1: Seed do cupom de boas-vindas

**Files:**
- Create: `orders/migrations/0003_seed_welcome_coupon.py`
- Test: `orders/tests.py` (classe nova `WelcomeCouponSeedTests`)

**Interfaces:**
- Produces: registro `Coupon(code="BEMVINDO10", discount_type="PERCENTAGE", discount_value=10, is_active=True)` no banco após a migration rodar.

- [ ] **Step 1: Escrever o teste (falho) que confirma o seed**

```python
# orders/tests.py — adicionar ao final do arquivo
from orders.models import Coupon


class WelcomeCouponSeedTests(APITestCase):
    def test_seed_cria_cupom_bemvindo10(self):
        coupon = Coupon.objects.filter(code="BEMVINDO10").first()
        self.assertIsNotNone(coupon)
        self.assertEqual(coupon.discount_type, "PERCENTAGE")
        self.assertEqual(coupon.discount_value, 10)
        self.assertTrue(coupon.is_active)
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `pytest orders/tests.py::WelcomeCouponSeedTests -v`
Expected: FAIL — `AssertionError: None is not None` (nenhum cupom existe ainda).

- [ ] **Step 3: Criar a data migration**

```python
# orders/migrations/0003_seed_welcome_coupon.py
from django.db import migrations


def seed_welcome_coupon(apps, schema_editor):
    Coupon = apps.get_model("orders", "Coupon")
    Coupon.objects.get_or_create(
        code="BEMVINDO10",
        defaults={
            "discount_type": "PERCENTAGE",
            "discount_value": 10,
            "is_active": True,
            "expiration_date": None,
        },
    )


def remove_welcome_coupon(apps, schema_editor):
    Coupon = apps.get_model("orders", "Coupon")
    Coupon.objects.filter(code="BEMVINDO10").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0002_orderstatuslog"),
    ]

    operations = [
        migrations.RunPython(seed_welcome_coupon, remove_welcome_coupon),
    ]
```

- [ ] **Step 4: Rodar as migrations e o teste de novo**

Run: `python manage.py migrate orders && pytest orders/tests.py::WelcomeCouponSeedTests -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add orders/migrations/0003_seed_welcome_coupon.py orders/tests.py
git commit -m "feat(orders): seed cupom BEMVINDO10 de boas-vindas"
```

---

### Task 2: Helper de elegibilidade + aplicar desconto no checkout

**Files:**
- Modify: `orders/services.py`
- Modify: `orders/views.py:362` (`CheckoutAPIView.post`)
- Modify: `orders/tests.py:78` (corrigir asserção que quebra com o desconto)
- Test: `orders/tests.py` (classe `CheckoutAPITests`, novos casos)

**Interfaces:**
- Consumes: `Coupon` model (Task 1, `orders.models.Coupon`, código `"BEMVINDO10"`).
- Produces: `get_welcome_discount(user, subtotal) -> tuple[Coupon | None, Decimal]` em `orders/services.py`, reaproveitado pela Task 3.

- [ ] **Step 1: Escrever os testes (falhos) para o desconto automático**

```python
# orders/tests.py — dentro de CheckoutAPITests, adicionar dois métodos novos
    @patch("orders.views.create_infinitepay_checkout")
    def test_primeira_compra_aplica_desconto_de_boas_vindas(self, mock_create_checkout):
        mock_create_checkout.return_value = "https://pay.infinitepay.io/mock-url"

        payload = {"address_id": str(self.address.id), "shipping_cost": 15.00}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = CustomerOrder.objects.get(user=self.user)
        self.assertEqual(order.discount_amount, 20.00)  # 10% de 200.00
        self.assertEqual(order.total_amount, 195.00)  # 200 - 20 + 15
        self.assertEqual(order.coupon.code, "BEMVINDO10")

    @patch("orders.views.create_infinitepay_checkout")
    def test_segunda_compra_nao_aplica_desconto(self, mock_create_checkout):
        mock_create_checkout.return_value = "https://pay.infinitepay.io/mock-url"

        CustomerOrder.objects.create(
            user=self.user,
            subtotal=50.00,
            total_amount=50.00,
            status=OrderStatus.PAID,
        )

        payload = {"address_id": str(self.address.id), "shipping_cost": 15.00}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_order = CustomerOrder.objects.filter(user=self.user).exclude(
            subtotal=50.00
        ).first()
        self.assertEqual(new_order.discount_amount, 0)
        self.assertIsNone(new_order.coupon)
```

- [ ] **Step 2: Corrigir a asserção existente que vai quebrar**

O teste `test_checkout_sucesso_gera_pedido_e_reduz_estoque` (linha ~57) usa um usuário sem pedidos prévios — com o desconto automático, o total dele muda de `215.00` para `195.00`. Editar:

```python
# orders/tests.py:78 — trocar
        self.assertEqual(order.total_amount, 215.00)
# por
        self.assertEqual(order.total_amount, 195.00)
        self.assertEqual(order.discount_amount, 20.00)
```

- [ ] **Step 3: Rodar os testes e confirmar que falham**

Run: `pytest orders/tests.py::CheckoutAPITests -v`
Expected: FAIL nos 3 casos (desconto não existe ainda; `test_checkout_sucesso_gera_pedido_e_reduz_estoque` falha com o valor antigo até a Step 2 já corrigir a asserção — nesse ponto ele falha por `order.total_amount` ainda vir `215.00` do código atual, confirmando que a implementação é que falta).

- [ ] **Step 4: Implementar o helper em `services.py`**

```python
# orders/services.py:10-17 — o bloco de import já existente é:
#   from orders.models import (
#       Cart,
#       CartItem,
#       OrderStatus,
#       OrderStatusLog,
#       Payment,
#       PaymentStatus,
#   )
# Trocar por (adicionar Coupon e CustomerOrder à mesma tupla, sem criar um import novo):
from orders.models import (
    Cart,
    CartItem,
    Coupon,
    CustomerOrder,
    OrderStatus,
    OrderStatusLog,
    Payment,
    PaymentStatus,
)


# orders/services.py — adicionar esta função nova ao final do arquivo:
def get_welcome_discount(user, subtotal):
    """Retorna (coupon, discount_amount) para o desconto de boas-vindas,
    ou (None, Decimal('0.00')) se o usuário não for elegível."""
    if not user.is_authenticated:
        return None, Decimal("0.00")

    has_previous_order = CustomerOrder.objects.filter(user=user).exists()
    if has_previous_order:
        return None, Decimal("0.00")

    coupon = Coupon.objects.filter(code="BEMVINDO10", is_active=True).first()
    if not coupon:
        return None, Decimal("0.00")

    discount = (subtotal * (coupon.discount_value / Decimal("100"))).quantize(
        Decimal("0.01")
    )
    return coupon, discount
```

- [ ] **Step 5: Usar o helper em `CheckoutAPIView.post`**

```python
# orders/views.py — no topo, adicionar aos imports de .services:
#   get_welcome_discount,
# e adicionar `from decimal import Decimal` no topo do arquivo.

# orders/views.py:390-407 — trocar o bloco:
        subtotal = sum(item.quantity * item.unit_price for item in cart.items.all())
        shipping_cost = request.data.get("shipping_cost", 0.00)
        total_amount = float(subtotal) + float(shipping_cost)

        order = CustomerOrder.objects.create(
            user=user,
            address=address,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            shipping_zip_code=address.zip_code,
            shipping_street=address.street,
            shipping_number=address.address_number,
            shipping_complement=address.complement,
            shipping_neighborhood=address.neighborhood,
            shipping_city=address.city,
            shipping_state=address.state,
        )
# por:
        subtotal = sum(item.quantity * item.unit_price for item in cart.items.all())
        shipping_cost = request.data.get("shipping_cost", 0.00)
        welcome_coupon, discount_amount = get_welcome_discount(user, subtotal)
        total_amount = float(subtotal) - float(discount_amount) + float(shipping_cost)

        order = CustomerOrder.objects.create(
            user=user,
            address=address,
            coupon=welcome_coupon,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            discount_amount=discount_amount,
            total_amount=total_amount,
            shipping_zip_code=address.zip_code,
            shipping_street=address.street,
            shipping_number=address.address_number,
            shipping_complement=address.complement,
            shipping_neighborhood=address.neighborhood,
            shipping_city=address.city,
            shipping_state=address.state,
        )
```

- [ ] **Step 6: Rodar os testes e confirmar que passam**

Run: `pytest orders/tests.py::CheckoutAPITests -v`
Expected: PASS em todos os casos.

- [ ] **Step 7: Commit**

```bash
git add orders/services.py orders/views.py orders/tests.py
git commit -m "feat(orders): aplicar desconto de 10% de boas-vindas na primeira compra"
```

---

### Task 3: Expor elegibilidade de desconto no carrinho

**Files:**
- Modify: `orders/services.py` (`get_cart_data`)
- Modify: `orders/serializers.py` (`CartRepresentationSerializer`)
- Test: `orders/tests.py` (classe de testes de carrinho autenticado)

**Interfaces:**
- Consumes: `get_welcome_discount(user, subtotal)` (Task 2, `orders/services.py`).
- Produces: `GET /api/orders/cart/` passa a retornar `eligible_for_welcome_discount: bool` e `welcome_discount_amount: str` (decimal serializado), consumidos pela Task 13 (frontend).

- [ ] **Step 1: Escrever o teste (falho)**

```python
# orders/tests.py — localizar a classe de testes autenticados de carrinho
# (contém test_authenticated_get_empty_cart) e adicionar:
    def test_cart_expõe_elegibilidade_de_desconto_para_usuario_sem_pedidos(self):
        response = self.client.get("/api/orders/cart/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["eligible_for_welcome_discount"])

    def test_cart_nao_expõe_desconto_para_usuario_com_pedido_anterior(self):
        CustomerOrder.objects.create(
            user=self.user, subtotal=10.00, total_amount=10.00,
            status=OrderStatus.PAID,
        )
        response = self.client.get("/api/orders/cart/")
        self.assertFalse(response.json()["eligible_for_welcome_discount"])
        self.assertEqual(response.json()["welcome_discount_amount"], "0.00")
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pytest orders/tests.py -k "elegibilidade_de_desconto or nao_expõe_desconto" -v`
Expected: FAIL — `KeyError: 'eligible_for_welcome_discount'`

- [ ] **Step 3: Adicionar os campos em `get_cart_data` (branch autenticado)**

```python
# orders/services.py — dentro de get_cart_data, branch `if request.user.is_authenticated:`
# trocar o `return` final desse branch (linhas 145-149):
        return {
            "id": cart.id,
            "items": items,
            "subtotal": subtotal,
        }
# por:
        welcome_coupon, welcome_discount_amount = get_welcome_discount(
            request.user, subtotal
        )
        return {
            "id": cart.id,
            "items": items,
            "subtotal": subtotal,
            "eligible_for_welcome_discount": welcome_coupon is not None,
            "welcome_discount_amount": welcome_discount_amount,
        }
```

Também no branch de carrinho vazio (linha 125) e no branch anônimo (linha ~199-203), adicionar os mesmos dois campos com `False`/`Decimal("0.00")`:

```python
# linha 125
            return {
                "id": None, "items": [], "subtotal": Decimal("0.00"),
                "eligible_for_welcome_discount": False,
                "welcome_discount_amount": Decimal("0.00"),
            }
# branch anônimo, linhas 199-203
        return {
            "id": None,
            "items": items,
            "subtotal": subtotal,
            "eligible_for_welcome_discount": False,
            "welcome_discount_amount": Decimal("0.00"),
        }
```

- [ ] **Step 4: Adicionar os campos no serializer**

```python
# orders/serializers.py:144-147 — trocar
class CartRepresentationSerializer(serializers.Serializer):
    id = serializers.UUIDField(allow_null=True)
    items = CartItemRepresentationSerializer(many=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
# por
class CartRepresentationSerializer(serializers.Serializer):
    id = serializers.UUIDField(allow_null=True)
    items = CartItemRepresentationSerializer(many=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    eligible_for_welcome_discount = serializers.BooleanField()
    welcome_discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `pytest orders/tests.py -k "elegibilidade_de_desconto or nao_expõe_desconto" -v`
Expected: PASS

- [ ] **Step 6: Rodar a suíte completa de `orders` pra garantir que nada mais quebrou**

Run: `pytest orders/tests.py -v`
Expected: PASS em todos os testes.

- [ ] **Step 7: Commit**

```bash
git add orders/services.py orders/serializers.py orders/tests.py
git commit -m "feat(orders): expor elegibilidade de desconto de boas-vindas no carrinho"
```

---

### Task 4: Model `NewsletterSubscriber`

**Files:**
- Modify: `authentication/models.py`
- Create: `authentication/migrations/0003_newslettersubscriber.py`
- Modify: `authentication/admin.py`
- Test: `authentication/tests.py`

**Interfaces:**
- Produces: `authentication.models.NewsletterSubscriber` com campos `id`, `email` (único), `consent_lgpd`, `subscribed_at`, `unsubscribed_at`. Consumido pela Task 5.

- [ ] **Step 1: Escrever o teste (falho)**

```python
# authentication/tests.py:19 — trocar o import existente
# from .models import UserProfile, UserRole
# por
from .models import NewsletterSubscriber, UserProfile, UserRole

# authentication/tests.py — adicionar esta classe nova ao final do arquivo:
class NewsletterSubscriberModelTests(TestCase):
    def test_cria_assinante_com_consentimento(self):
        subscriber = NewsletterSubscriber.objects.create(
            email="fan@shio.com", consent_lgpd=True
        )
        self.assertTrue(subscriber.consent_lgpd)
        self.assertIsNotNone(subscriber.subscribed_at)

    def test_email_e_unico(self):
        NewsletterSubscriber.objects.create(email="dup@shio.com", consent_lgpd=True)
        with self.assertRaises(Exception):
            NewsletterSubscriber.objects.create(email="dup@shio.com", consent_lgpd=True)
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `pytest authentication/tests.py::NewsletterSubscriberModelTests -v`
Expected: FAIL — `ImportError: cannot import name 'NewsletterSubscriber'`

- [ ] **Step 3: Criar o model**

```python
# authentication/models.py — adicionar ao final do arquivo
class NewsletterSubscriber(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name="Email")
    consent_lgpd = models.BooleanField(default=False, verbose_name="Consentimento LGPD")
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.email
```

`uuid` já está importado no topo de `authentication/models.py` (usado por outros models do app) — conferir e reaproveitar o import existente.

- [ ] **Step 4: Gerar e rodar a migration**

Run: `python manage.py makemigrations authentication --name newslettersubscriber`
Run: `python manage.py migrate authentication`

- [ ] **Step 5: Registrar no admin**

```python
# authentication/admin.py:5 — trocar o import existente
# from .models import User
# por
from .models import NewsletterSubscriber, User

# authentication/admin.py — adicionar ao final do arquivo:
@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ["email", "consent_lgpd", "subscribed_at", "unsubscribed_at"]
    list_filter = ["consent_lgpd"]
    search_fields = ["email"]
    ordering = ["-subscribed_at"]
```

- [ ] **Step 6: Rodar os testes e confirmar que passam**

Run: `pytest authentication/tests.py::NewsletterSubscriberModelTests -v`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add authentication/models.py authentication/migrations/ authentication/admin.py authentication/tests.py
git commit -m "feat(authentication): adicionar model NewsletterSubscriber"
```

---

### Task 5: Endpoint de inscrição na newsletter

**Files:**
- Modify: `authentication/serializers.py`
- Modify: `authentication/views.py`
- Modify: `authentication/urls.py`
- Test: `authentication/tests.py`

**Interfaces:**
- Consumes: `NewsletterSubscriber` (Task 4).
- Produces: `POST /api/auth/newsletter/subscribe/` (público). Body `{"email": str, "consent_lgpd": bool}`. `201` na primeira inscrição, `200` se já inscrito, `400` se `consent_lgpd` falso ou email inválido. Consumido pela Task 12 (frontend).

- [ ] **Step 1: Escrever os testes (falhos)**

```python
# authentication/tests.py — adicionar ao final do arquivo
class NewsletterSubscribeAPITests(APITestCase):
    def setUp(self):
        self.url = "/api/auth/newsletter/subscribe/"

    def test_inscricao_com_consentimento_retorna_201(self):
        response = self.client.post(
            self.url, {"email": "novo@shio.com", "consent_lgpd": True}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            NewsletterSubscriber.objects.filter(email="novo@shio.com").exists()
        )

    def test_inscricao_sem_consentimento_retorna_400(self):
        response = self.client.post(
            self.url, {"email": "semconsentimento@shio.com", "consent_lgpd": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            NewsletterSubscriber.objects.filter(
                email="semconsentimento@shio.com"
            ).exists()
        )

    def test_email_invalido_retorna_400(self):
        response = self.client.post(
            self.url, {"email": "nao-e-email", "consent_lgpd": True}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reinscricao_de_email_existente_retorna_200_sem_duplicar(self):
        NewsletterSubscriber.objects.create(email="ja@shio.com", consent_lgpd=True)
        response = self.client.post(
            self.url, {"email": "ja@shio.com", "consent_lgpd": True}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            NewsletterSubscriber.objects.filter(email="ja@shio.com").count(), 1
        )
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `pytest authentication/tests.py::NewsletterSubscribeAPITests -v`
Expected: FAIL — `404 Not Found` (rota não existe).

- [ ] **Step 3: Criar o serializer**

```python
# authentication/serializers.py — adicionar ao final do arquivo
# (é um serializers.Serializer simples, não referencia o model diretamente,
# então não precisa de import novo)
class NewsletterSubscribeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    consent_lgpd = serializers.BooleanField()

    def validate_consent_lgpd(self, value):
        if not value:
            raise serializers.ValidationError(
                "É necessário aceitar o consentimento para se inscrever."
            )
        return value
```

- [ ] **Step 4: Criar a view**

```python
# authentication/views.py:20-31 — o import de .serializers já existente é:
#   from .serializers import (
#       AddressSerializer,
#       CustomerCRMDetailSerializer,
#       CustomerCRMSerializer,
#       GoogleAuthSerializer,
#       LogoutInputSerializer,
#       TokenRefreshInputSerializer,
#       UserSerializer,
#       RegisterSerializer,
#       PasswordLoginSerializer,
#   )
# Adicionar `NewsletterSubscribeSerializer,` a essa tupla, e logo abaixo dela
# (antes do import de .services) adicionar um import novo para o model:
from .models import NewsletterSubscriber

# authentication/views.py — adicionar esta classe nova ao final do arquivo:
class NewsletterSubscribeView(APIView):
    """Inscrição pública na newsletter, com consentimento LGPD obrigatório."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = NewsletterSubscribeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        existing = NewsletterSubscriber.objects.filter(email=email).first()
        if existing:
            if not existing.consent_lgpd:
                existing.consent_lgpd = True
                existing.unsubscribed_at = None
                existing.save()
            return Response(
                {"message": "E-mail já inscrito."}, status=status.HTTP_200_OK
            )

        NewsletterSubscriber.objects.create(email=email, consent_lgpd=True)
        return Response(
            {"message": "Inscrito com sucesso!"}, status=status.HTTP_201_CREATED
        )
```

- [ ] **Step 5: Registrar a rota**

```python
# authentication/urls.py — adicionar ao import de .views:
#   NewsletterSubscribeView,
# e ao urlpatterns, junto das rotas públicas:
    path(
        "newsletter/subscribe/",
        NewsletterSubscribeView.as_view(),
        name="newsletter-subscribe",
    ),
```

- [ ] **Step 6: Rodar os testes e confirmar que passam**

Run: `pytest authentication/tests.py::NewsletterSubscribeAPITests -v`
Expected: PASS

- [ ] **Step 7: Rodar a suíte completa de `authentication`**

Run: `pytest authentication/tests.py -v`
Expected: PASS em todos os testes.

- [ ] **Step 8: Commit**

```bash
git add authentication/serializers.py authentication/views.py authentication/urls.py authentication/tests.py
git commit -m "feat(authentication): endpoint público de inscrição na newsletter com consentimento LGPD"
```

---

## Frontend (`repo: frontend`, branch `O9-promessas-comerciais`)

### Task 6: Corrigir texto do banner (20% → 10%)

**Files:**
- Modify: `src/components/layout/public/Navbar.jsx:30`
- Test: `src/components/layout/public/Navbar.test.jsx`

- [ ] **Step 1: Escrever o teste (falho)**

```jsx
// src/components/layout/public/Navbar.test.jsx — adicionar novo `it` dentro do describe existente
  it('should show the correct welcome discount in the banner', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText(/10% de desconto/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/components/layout/public/Navbar.test.jsx`
Expected: FAIL — texto "10% de desconto" não encontrado (hoje é "20%").

- [ ] **Step 3: Corrigir o texto**

```jsx
// src/components/layout/public/Navbar.jsx:30 — trocar
            Cadastre-se e ganhe 20% de desconto no seu primeiro pedido.{' '}
// por
            Cadastre-se e ganhe 10% de desconto no seu primeiro pedido.{' '}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/components/layout/public/Navbar.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/public/Navbar.jsx src/components/layout/public/Navbar.test.jsx
git commit -m "fix(navbar): corrigir banner de desconto de boas-vindas para 10%"
```

---

### Task 7: Remover estrelas de avaliação fixas

**Files:**
- Modify: `src/components/ui/ShioDesign.jsx:55-79` (`ProductCard`)
- Test: `src/components/ui/ShioDesign.test.jsx` (novo arquivo)

**Interfaces:**
- Consumes: nada novo.
- Produces: `ProductCard` deixa de renderizar `<Rating />`. O componente `Rating` continua exportado (sem uso) até a issue de avaliação real substituí-lo.

- [ ] **Step 1: Escrever o teste (falho)**

```jsx
// src/components/ui/ShioDesign.test.jsx — novo arquivo
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductCard } from './ShioDesign';

describe('ProductCard', () => {
  it('should not render a fake star rating', () => {
    const product = { id: '1', name: 'Camiseta', price: 'R$ 99,90', rating: null };
    render(
      <BrowserRouter>
        <ProductCard product={product} />
      </BrowserRouter>
    );
    expect(screen.queryByText('★★★★★')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/components/ui/ShioDesign.test.jsx`
Expected: FAIL — `★★★★★` encontrado no DOM.

- [ ] **Step 3: Remover o `<Rating />` do `ProductCard`**

```jsx
// src/components/ui/ShioDesign.jsx:66-69 — trocar
      <h3 className="mt-4 text-[16px] font-semibold leading-tight text-black">{product.name}</h3>
      <div className="mt-1">
        <Rating value={product.rating} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
// por
      <h3 className="mt-4 text-[16px] font-semibold leading-tight text-black">{product.name}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/components/ui/ShioDesign.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ShioDesign.jsx src/components/ui/ShioDesign.test.jsx
git commit -m "fix(product-card): remover estrelas de avaliação fixas sem dado real"
```

---

### Task 8: Remover promessa de e-mail de confirmação (PixPage)

**Files:**
- Modify: `src/pages/public/PixPage/index.jsx:142`
- Test: `src/pages/public/PixPage/index.test.jsx` (verificar se já existe; se não, criar)

- [ ] **Step 1: Checar se já existe teste para PixPage**

Run: `ls src/pages/public/PixPage/`

Se existir `index.test.jsx`, adicionar o caso abaixo nele; senão, criar o arquivo com o bloco mínimo abaixo.

```jsx
// src/pages/public/PixPage/index.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PixPage from './index';

describe('PixPage', () => {
  it('should not promise an order confirmation email', () => {
    render(
      <MemoryRouter initialEntries={['/pix']}>
        <PixPage />
      </MemoryRouter>
    );
    expect(screen.queryByText(/enviamos.*e-mail/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/public/PixPage/index.test.jsx`
Expected: FAIL — texto de e-mail encontrado.

- [ ] **Step 3: Trocar o texto**

```jsx
// src/pages/public/PixPage/index.jsx:141-143 — trocar
            <p className="mt-2 text-[13px] text-black/50">
              Enviamos os detalhes da sua compra para o seu e-mail.
            </p>
// por
            <p className="mt-2 text-[13px] text-black/50">
              Guarde o número do pedido para acompanhar o status em Meus Pedidos.
            </p>
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/pages/public/PixPage/index.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/public/PixPage/index.jsx src/pages/public/PixPage/index.test.jsx
git commit -m "fix(pix): remover promessa de e-mail de confirmação inexistente"
```

---

### Task 9: Remover links de termos/privacidade (rodapé + login)

**Files:**
- Modify: `src/components/layout/shared/Footer.jsx:15-42`
- Modify: `src/pages/user/LoginPage/index.jsx:80`
- Test: `src/components/layout/shared/Footer.test.jsx` (novo, se não existir)

- [ ] **Step 1: Escrever o teste (falho) do rodapé**

```jsx
// src/components/layout/shared/Footer.test.jsx — novo arquivo
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer', () => {
  it('should not link to terms or privacy pages', () => {
    render(
      <BrowserRouter>
        <Footer showNewsletter={false} />
      </BrowserRouter>
    );
    expect(screen.queryByText('Termos de uso')).not.toBeInTheDocument();
    expect(screen.queryByText('Política de privacidade')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/components/layout/shared/Footer.test.jsx`
Expected: FAIL — os dois textos são encontrados.

- [ ] **Step 3: Remover os itens do array `columns`**

```jsx
// src/components/layout/shared/Footer.jsx:15-23 — trocar
  {
    title: 'Ajuda',
    links: [
      { label: 'Suporte ao cliente', to: '/' },
      { label: 'Prazo de entrega', to: '/' },
      { label: 'Trocas e devoluções', to: '/' },
      { label: 'Política de privacidade', to: '/' },
    ],
  },
// por
  {
    title: 'Ajuda',
    links: [
      { label: 'Suporte ao cliente', to: '/' },
      { label: 'Prazo de entrega', to: '/' },
      { label: 'Trocas e devoluções', to: '/' },
    ],
  },
```

```jsx
// src/components/layout/shared/Footer.jsx:33-41 — trocar
  {
    title: 'Redes sociais',
    links: [
      { label: 'Instagram', to: '/' },
      { label: 'WhatsApp', to: '/' },
      { label: 'TikTok', to: '/' },
      { label: 'Termos de uso', to: '/' },
    ],
  },
// por
  {
    title: 'Redes sociais',
    links: [
      { label: 'Instagram', to: '/' },
      { label: 'WhatsApp', to: '/' },
      { label: 'TikTok', to: '/' },
    ],
  },
```

- [ ] **Step 4: Rodar o teste do rodapé e confirmar que passa**

Run: `npx vitest run src/components/layout/shared/Footer.test.jsx`
Expected: PASS

- [ ] **Step 5: Corrigir os links quebrados no LoginPage**

```jsx
// src/pages/user/LoginPage/index.jsx:80 — trocar
          Ao continuar você concorda com nossos <Link to="/termos" className="font-semibold text-gray-500 hover:text-black transition-colors">Termos de uso</Link> e <Link to="/privacidade" className="font-semibold text-gray-500 hover:text-black transition-colors">Política de Privacidade</Link>
// por
          Ao continuar você concorda com nossos Termos de uso e Política de Privacidade
```

Conferir se `Link` continua sendo usado em outro ponto do arquivo antes de remover o import — se não estiver mais em uso, remover o import de `Link` do topo do arquivo.

- [ ] **Step 6: Rodar a suíte completa de frontend pra garantir que nada mais quebrou**

Run: `npm run test -- --run`
Expected: PASS em todos os testes.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/shared/Footer.jsx src/components/layout/shared/Footer.test.jsx src/pages/user/LoginPage/index.jsx
git commit -m "fix(footer,login): remover links de termos/privacidade sem conteúdo"
```

---

### Task 10: Ajustar selos de forma de pagamento (InfinitePay)

**Files:**
- Modify: `src/components/layout/shared/Footer.jsx:44-57` (`PaymentBadges`)
- Test: `src/components/layout/shared/Footer.test.jsx`

- [ ] **Step 1: Adicionar o teste (falho)**

```jsx
// src/components/layout/shared/Footer.test.jsx — adicionar ao describe existente
  it('should show only the payment methods InfinitePay actually accepts', () => {
    render(
      <BrowserRouter>
        <Footer showNewsletter={false} />
      </BrowserRouter>
    );
    expect(screen.getByText('Pix')).toBeInTheDocument();
    expect(screen.getByText('Cartão')).toBeInTheDocument();
    expect(screen.getByText('Boleto')).toBeInTheDocument();
    expect(screen.queryByText('VISA')).not.toBeInTheDocument();
    expect(screen.queryByText('PayPal')).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/components/layout/shared/Footer.test.jsx`
Expected: FAIL — "Pix"/"Cartão"/"Boleto" não encontrados, "VISA"/"PayPal" ainda presentes.

- [ ] **Step 3: Substituir `PaymentBadges`**

```jsx
// src/components/layout/shared/Footer.jsx:44-57 — trocar o corpo inteiro da função por
function PaymentBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-3 md:justify-end">
      <span className="flex h-7 items-center justify-center rounded bg-white px-3 text-[11px] font-bold text-[#10a545] shadow-sm">Pix</span>
      <span className="flex h-7 items-center justify-center rounded bg-white px-3 text-[11px] font-bold text-black shadow-sm">Cartão</span>
      <span className="flex h-7 items-center justify-center rounded bg-white px-3 text-[11px] font-bold text-black shadow-sm">Boleto</span>
    </div>
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/components/layout/shared/Footer.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/shared/Footer.jsx src/components/layout/shared/Footer.test.jsx
git commit -m "fix(footer): trocar selos de pagamento pelos métodos reais da InfinitePay"
```

---

### Task 11: Remover campo "Código promocional" morto do carrinho

**Files:**
- Modify: `src/pages/public/CartPage/index.jsx:157-163`
- Test: `src/pages/public/CartPage/index.test.jsx` (novo, se não existir)

- [ ] **Step 1: Checar se já existe teste para CartPage**

Run: `ls src/pages/public/CartPage/`

Se não existir `index.test.jsx`, criar com o bloco abaixo (mock mínimo de `useCart` e `fetch`, seguindo o padrão do `Navbar.test.jsx`).

```jsx
// src/pages/public/CartPage/index.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CartPage from './index';

vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({ cartItems: [], setCartData: vi.fn(), refreshCart: vi.fn() }),
}));

describe('CartPage', () => {
  it('should not show a dead promo code field', () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );
    expect(screen.queryByPlaceholderText('Código promocional')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/public/CartPage/index.test.jsx`
Expected: FAIL — o placeholder "Código promocional" é encontrado.

- [ ] **Step 3: Remover o bloco**

```jsx
// src/pages/public/CartPage/index.jsx:156-164 — remover por completo
              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_120px]">
                <label className="flex h-12 items-center gap-3 rounded-full bg-[#f0f0f0] px-5 text-black/40">
                  <Icon name="tag" className="h-5 w-5 shrink-0" />
                  <input className="w-full bg-transparent text-sm outline-none placeholder:text-black/35" placeholder="Código promocional" />
                </label>
                <button className="h-12 rounded-full bg-black text-sm font-medium text-white">Aplicar</button>
              </div>

```

Conferir se `Icon` com `name="tag"` é usado em outro ponto do arquivo antes de mexer em imports (não é — `Icon` continua em uso por outros ícones no mesmo arquivo, então o import continua necessário).

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/pages/public/CartPage/index.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/public/CartPage/index.jsx src/pages/public/CartPage/index.test.jsx
git commit -m "fix(cart): remover campo de código promocional sem funcionalidade"
```

---

### Task 12: Newsletter real com consentimento LGPD

**Files:**
- Modify: `src/components/ui/ShioDesign.jsx:100-153` (`NewsletterBand`)
- Test: `src/components/ui/ShioDesign.test.jsx`

**Interfaces:**
- Consumes: `POST /api/auth/newsletter/subscribe/` (backend Task 5) via `apiClient` (`src/lib/axios.js`).

- [ ] **Step 1: Escrever os testes (falhos)**

`@testing-library/user-event` **não está instalado neste projeto** (não consta em `package.json`) — usar `fireEvent`, que já vem com `@testing-library/react` (dependência existente), para não introduzir uma dependência nova por uma única task.

```jsx
// src/components/ui/ShioDesign.test.jsx — o arquivo já importa `render, screen` de
// '@testing-library/react' desde a Task 7; adicionar `fireEvent` a esse import existente:
import { fireEvent, render, screen } from '@testing-library/react';
// ... e adicionar, junto dos demais imports do arquivo:
import apiClient from '../../lib/axios';
import { NewsletterBand } from './ShioDesign';

vi.mock('../../lib/axios', () => ({
  default: { post: vi.fn() },
}));

describe('NewsletterBand', () => {
  it('should keep the submit button disabled until consent is checked', () => {
    render(<NewsletterBand />);
    const submit = screen.getByRole('button', { name: /inscrever-se/i });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Digite seu e-mail'), {
      target: { value: 'fan@shio.com' },
    });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(submit).not.toBeDisabled();
  });

  it('should call the real subscribe endpoint with consent', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'Inscrito com sucesso!' } });
    render(<NewsletterBand />);

    fireEvent.change(screen.getByPlaceholderText('Digite seu e-mail'), {
      target: { value: 'fan@shio.com' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /inscrever-se/i }));

    expect(apiClient.post).toHaveBeenCalledWith('/auth/newsletter/subscribe/', {
      email: 'fan@shio.com',
      consent_lgpd: true,
    });
    expect(await screen.findByText('Inscrito com sucesso!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/components/ui/ShioDesign.test.jsx`
Expected: FAIL — não existe checkbox, botão nunca fica desabilitado, `apiClient.post` nunca é chamado.

- [ ] **Step 3: Reescrever `NewsletterBand`**

```jsx
// src/components/ui/ShioDesign.jsx:100-153 — substituir a função inteira por:
export function NewsletterBand() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid || !consent) return;

    setSubmitting(true);
    setErrorMessage('');
    try {
      await apiClient.post('/auth/newsletter/subscribe/', {
        email,
        consent_lgpd: consent,
      });
      setStatus('success');
      setEmail('');
      setConsent(false);
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.email?.[0] ??
        err.response?.data?.consent_lgpd?.[0] ??
        'Não foi possível concluir a inscrição.'
      );
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1240px] px-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 rounded-[20px] bg-black px-8 py-9 text-white md:grid-cols-[1fr_420px] md:items-center md:px-14">
          <h2 className="max-w-xl text-[30px] font-black uppercase leading-[1.08] md:text-[36px]">
            Cadastre-se para receber novidades
          </h2>
          <div className="grid gap-3">
            <label className="flex h-12 items-center gap-3 rounded-full bg-white px-5 text-black/45">
              <Icon name="mail" className="h-5 w-5 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35"
              />
            </label>
            {status === 'success' ? (
              <p className="h-12 flex items-center justify-center rounded-full bg-[#10a545] text-sm font-medium text-white">
                Inscrito com sucesso!
              </p>
            ) : (
              <>
                <label className="flex items-start gap-2 text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5"
                  />
                  Aceito receber comunicações da Shio por e-mail, conforme a Política de Privacidade.
                </label>
                <button
                  type="submit"
                  disabled={!isEmailValid || !consent || submitting}
                  className="h-12 rounded-full bg-white text-sm font-medium text-black transition hover:bg-[#f2f2f2] disabled:opacity-40"
                >
                  Inscrever-se
                </button>
                {status === 'error' && (
                  <p className="text-center text-xs text-red-400">{errorMessage}</p>
                )}
              </>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
```

Adicionar o import de `apiClient` no topo de `src/components/ui/ShioDesign.jsx`: `import apiClient from '../../lib/axios';`.

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npx vitest run src/components/ui/ShioDesign.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ShioDesign.jsx src/components/ui/ShioDesign.test.jsx
git commit -m "feat(newsletter): inscrever de verdade com consentimento LGPD"
```

---

### Task 13: Exibir desconto de boas-vindas no carrinho e pagamento

**Files:**
- Modify: `src/context/CartContext.jsx`
- Modify: `src/pages/public/CartPage/index.jsx`
- Modify: `src/pages/public/PaymentPage/index.jsx`
- Modify: `src/pages/public/PixPage/index.jsx`
- Test: `src/context/CartContext.test.jsx` (novo, se não existir), `src/pages/public/CartPage/index.test.jsx`

**Interfaces:**
- Consumes: `eligible_for_welcome_discount` e `welcome_discount_amount` de `GET /api/orders/cart/` (backend Task 3).

- [ ] **Step 1: Escrever o teste (falho) do `CartContext`**

```jsx
// src/context/CartContext.test.jsx — novo arquivo
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CartProvider, useCart } from './CartContext';

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      items: [], subtotal: '0.00',
      eligible_for_welcome_discount: true,
      welcome_discount_amount: '20.00',
    }),
  })
);

function Probe() {
  const { welcomeDiscountEligible, welcomeDiscountAmount } = useCart();
  return <span>{String(welcomeDiscountEligible)}-{welcomeDiscountAmount}</span>;
}

describe('CartContext', () => {
  it('should expose welcome discount eligibility from the cart response', async () => {
    render(<CartProvider><Probe /></CartProvider>);
    expect(await screen.findByText('true-20.00')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/context/CartContext.test.jsx`
Expected: FAIL — `welcomeDiscountEligible` é `undefined`.

- [ ] **Step 3: Estender `CartContext`**

```jsx
// src/context/CartContext.jsx — trocar o arquivo inteiro por:
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAccessToken } from '../lib/authToken';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CartContext = createContext({
  cartCount: 0,
  cartItems: [],
  welcomeDiscountEligible: false,
  welcomeDiscountAmount: '0.00',
  refreshCart: () => {},
  setCartData: () => {},
});

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [welcomeDiscountEligible, setWelcomeDiscountEligible] = useState(false);
  const [welcomeDiscountAmount, setWelcomeDiscountAmount] = useState('0.00');

  const setCartData = useCallback((data) => {
    const items = Array.isArray(data) ? data : (data.items ?? []);
    setCartItems(items);
    setCartCount(items.reduce((s, item) => s + (item.quantity ?? 1), 0));
    setWelcomeDiscountEligible(Boolean(data?.eligible_for_welcome_discount));
    setWelcomeDiscountAmount(data?.welcome_discount_amount ?? '0.00');
  }, []);

  const refreshCart = useCallback(async () => {
    const token = getAccessToken();
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/api/orders/cart/`, {
        headers,
        credentials: 'include',
      });
      if (!res.ok) { setCartCount(0); setCartItems([]); return; }
      const data = await res.json();
      setCartData(data);
    } catch {
      setCartCount(0);
    }
  }, [setCartData]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        welcomeDiscountEligible,
        welcomeDiscountAmount,
        refreshCart,
        setCartData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
```

- [ ] **Step 4: Rodar o teste do context e confirmar que passa**

Run: `npx vitest run src/context/CartContext.test.jsx`
Expected: PASS

- [ ] **Step 5: Escrever o teste (falho) da linha de desconto no `CartPage`**

```jsx
// src/pages/public/CartPage/index.test.jsx — adicionar novo teste, ajustando o mock de useCart
vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({
    cartItems: [{ variation_id: '1', product_id: 'p1', product_name: 'Camiseta', size: 'M', sku: 'SKU1', quantity: 1, unit_price: '100.00' }],
    welcomeDiscountEligible: true,
    welcomeDiscountAmount: '10.00',
    setCartData: vi.fn(),
    refreshCart: vi.fn(),
  }),
}));

// dentro do describe('CartPage', ...):
  it('should show the welcome discount line when eligible', () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Desconto de boas-vindas')).toBeInTheDocument();
    expect(screen.getByText('- R$ 10.00')).toBeInTheDocument();
  });
```

- [ ] **Step 6: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/public/CartPage/index.test.jsx`
Expected: FAIL — "Desconto de boas-vindas" não encontrado.

- [ ] **Step 7: Adicionar a linha de desconto no resumo do `CartPage`**

```jsx
// src/pages/public/CartPage/index.jsx:15-16 — trocar
  const { cartItems, setCartData, refreshCart } = useCart();
// por
  const { cartItems, welcomeDiscountEligible, welcomeDiscountAmount, setCartData, refreshCart } = useCart();
```

```jsx
// src/pages/public/CartPage/index.jsx:72-73 — depois de
  const items = cartItems;
  const subtotal = items.reduce((s, i) => s + i.quantity * parseFloat(i.unit_price ?? 0), 0);
// adicionar
  const discount = welcomeDiscountEligible ? parseFloat(welcomeDiscountAmount) : 0;
  const total = subtotal - discount;
```

```jsx
// src/pages/public/CartPage/index.jsx:142-154 — trocar o bloco de resumo por
              <div className="mt-6 space-y-5 text-[20px]">
                <div className="flex justify-between text-black/60">
                  <span>Subtotal</span>
                  <strong className="text-black">R$ {subtotal.toFixed(2)}</strong>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#10a545]">
                    <span>Desconto de boas-vindas</span>
                    <strong>- R$ {discount.toFixed(2)}</strong>
                  </div>
                )}
                <div className="flex justify-between border-b border-black/10 pb-5 text-black/60">
                  <span>Entrega</span>
                  <strong className="text-black">A calcular</strong>
                </div>
                <div className="flex justify-between text-[24px] text-black">
                  <span>Total</span>
                  <strong>R$ {total.toFixed(2)}</strong>
                </div>
              </div>
```

- [ ] **Step 8: Rodar o teste do `CartPage` e confirmar que passa**

Run: `npx vitest run src/pages/public/CartPage/index.test.jsx`
Expected: PASS

- [ ] **Step 9: Refletir o desconto em `PaymentPage`**

```jsx
// src/pages/public/PaymentPage/index.jsx:236-239 — trocar
  const items = cart?.items ?? [];
  const subtotal = parseFloat(cart?.subtotal ?? 0);
  const FRETE = freightData ? parseFloat(freightData.preco_final ?? 0) : 0;
  const pixDiscount = paymentMethod === 'pix' ? +(subtotal * 0.05).toFixed(2) : 0;
  const total = subtotal + FRETE - pixDiscount;
// por
  const items = cart?.items ?? [];
  const subtotal = parseFloat(cart?.subtotal ?? 0);
  const FRETE = freightData ? parseFloat(freightData.preco_final ?? 0) : 0;
  const pixDiscount = paymentMethod === 'pix' ? +(subtotal * 0.05).toFixed(2) : 0;
  const welcomeDiscount = cart?.eligible_for_welcome_discount
    ? parseFloat(cart.welcome_discount_amount ?? 0)
    : 0;
  const total = subtotal + FRETE - pixDiscount - welcomeDiscount;
```

Localizar o bloco do resumo de pagamento por volta da linha 439 (`<span>Subtotal</span>`) e adicionar, logo abaixo, uma linha condicional igual à do `CartPage`:

```jsx
                {welcomeDiscount > 0 && (
                  <div className="flex justify-between text-[#10a545]">
                    <span>Desconto de boas-vindas</span>
                    <span className="font-medium">- R$ {welcomeDiscount.toFixed(2)}</span>
                  </div>
                )}
```

E incluir o valor no `navigate('/pix', { state: {...} })` (linha ~220-226):

```jsx
        navigate('/pix', {
          state: {
            orderNumber: data.order_nsu ?? data.id ?? 'SH-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
            total: total,
            discount: welcomeDiscount,
            paymentMethod,
          },
        });
```

- [ ] **Step 10: Exibir o desconto na confirmação (`PixPage`)**

```jsx
// src/pages/public/PixPage/index.jsx — junto de onde `total` é lido de navState (linha ~26)
  const total = navState.total ?? null;
  const discount = navState.discount ?? 0;
```

Na seção "Order card" (perto da linha 147 em diante, junto de "Valor Total"), adicionar uma linha condicional:

```jsx
              {discount > 0 && (
                <div className="flex justify-between text-[13px] text-[#10a545]">
                  <span>Desconto de boas-vindas</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}
```

- [ ] **Step 11: Rodar toda a suíte de frontend**

Run: `npm run test -- --run`
Expected: PASS em todos os testes.

- [ ] **Step 12: Commit**

```bash
git add src/context/CartContext.jsx src/context/CartContext.test.jsx src/pages/public/CartPage/index.jsx src/pages/public/CartPage/index.test.jsx src/pages/public/PaymentPage/index.jsx src/pages/public/PixPage/index.jsx
git commit -m "feat(checkout): exibir desconto de boas-vindas no carrinho, pagamento e confirmação"
```

---

## Ordem recomendada de execução

1. Backend Task 1 → 2 → 3 (base do desconto; Task 2 depende da 1, Task 3 depende da 2).
2. Backend Task 4 → 5 (newsletter; Task 5 depende da 4).
3. Frontend Tasks 6, 7, 8, 9, 10, 11 — independentes entre si e do backend, podem rodar em qualquer ordem ou em paralelo.
4. Frontend Task 12 — depende do backend Task 5 já mesclado/disponível.
5. Frontend Task 13 — depende do backend Task 3 já mesclado/disponível.
