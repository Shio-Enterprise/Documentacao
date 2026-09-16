## O2: Expiração automática de reserva de estoque no checkout
**Responsável:** João Gabriel e Pedro Augusto

**Origem:**
- Diagnóstico consolidado do projeto (documento de análise inicial), item O2: ausência de proteção contra concorrência e contra carrinhos abandonados no checkout.
- Sem issue de definição própria publicada: a solução de concorrência e reversão de estoque já havia sido implementada pela branch `feat/o6-ciclo-pedidos` enquanto o O2 estava em desenvolvimento em paralelo, em cima de uma base desatualizada. O trabalho foi replanejado para reutilizar o que a O6 já entregou, em vez de duplicar a solução.

**Por que a melhoria foi relevante?**
O checkout debitava o estoque sem proteção contra concorrência e sem nunca devolvê-lo quando o cliente abandonava a compra antes de pagar. A O6, já mesclada na `dev`, resolveu a concorrência e a reversão de estoque (`move_stock`, `restore_order_stock`, `update_status` com máquina de estados via `ALLOWED_TRANSITIONS`), mas a devolução de estoque só acontece quando alguém muda o status do pedido manualmente. Pedidos `AWAITING_PAYMENT` abandonados (cliente fecha a aba, cai a conexão, desiste no meio do pagamento) ficavam com o estoque debitado indefinidamente, sem que ninguém cancelasse.

**Regras implementadas:**
- `CustomerOrder` recebeu o campo `reservation_expires_at`, gravado na criação do pedido como `timezone.now() + STOCK_RESERVATION_TTL_MINUTES`.
- `STOCK_RESERVATION_TTL_MINUTES` é configurável por variável de ambiente, com valor padrão de 30 minutos.
- A verificação de expiração é *lazy* (sem job em background, já que o projeto não possui Celery/cron): ocorre sempre que o pedido é consultado, em `UserOrderDetailView.get()` e `AdminOrderDetailView.get()`.
- Um pedido `AWAITING_PAYMENT` com prazo vencido é cancelado via `update_status(order, CANCELED, ...)`, reaproveitando o `restore_order_stock` já existente da O6 — nenhuma lógica de reversão de estoque foi duplicada.
- Pedidos com prazo ainda válido, ou sem prazo definido (pedidos criados antes desta mudança), não são afetados.

**Evidências (Pull Request) e situação da integração:**
- [Backend PR #9](https://github.com/Shio-Enterprise/backend/pull/9): aberto contra a `dev`, commit `4de9a2b`.

**Validações registradas no PR:**
- 3 testes automatizados novos em `orders/tests.py` (`StockReservationExpirationTests`), cobrindo: gravação do prazo no checkout, cancelamento e devolução de estoque em pedido expirado (confirmado via `StockMovement` de `DEVOLUCAO`), e não interferência em pedido com prazo ainda válido.
- Suíte completa executada com `make test`: os 3 testes novos passam. A execução também aponta 6 falhas pré-existentes na `dev`, confirmadas como não relacionadas a este PR (reproduzidas de forma idêntica na `dev` sem nenhuma alteração desta entrega) — originadas na branch `O3-Aplicar-disponibilidade-e-escassez-dos-drops`.
- `ruff check` sem erros nas partes alteradas por este PR.

### Evidências dos trechos de código do backend

**Campo de expiração no pedido — `orders/models.py`.** `CustomerOrder` recebe `reservation_expires_at`, opcional, usado como prazo da reserva de estoque.
![Campo de expiração no pedido](../../../assets/evidencias-02/01-model-reservation-expires-at.png)

**Verificação lazy de expiração — `orders/services.py`.** `release_if_expired` cancela o pedido vencido reaproveitando `update_status`, sem duplicar a lógica de reversão de estoque da O6.
![Verificação lazy de expiração](../../../assets/evidencias-02/02-release-if-expired.png)

**Prazo gravado no checkout — `orders/views.py`.** `reservation_expires_at` é definido na criação do pedido, usando o TTL configurável em `STOCK_RESERVATION_TTL_MINUTES`.
![Prazo gravado no checkout](../../../assets/evidencias-02/03-checkout-ttl.png)

**Teste de expiração e devolução de estoque — `orders/tests.py`.** Um pedido com prazo vencido, ao ser consultado, é cancelado e o estoque debitado na venda é devolvido via `StockMovement` de `DEVOLUCAO`.
![Teste de expiração e devolução de estoque](../../../assets/evidencias-02/04-teste-expiracao.png)