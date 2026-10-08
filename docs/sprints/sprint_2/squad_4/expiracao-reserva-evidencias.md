## Expiração automática da reserva de estoque
**Trio:** João Gabriel e João Reis

**Origem:**
- [Issue #43](https://github.com/Shio-Enterprise/Documentacao/issues/43) — automatizar a expiração da reserva de estoque do checkout.

**Por que a melhoria foi relevante?**
Ao finalizar a compra, o estoque fica reservado por 30 minutos enquanto o pagamento não é confirmado. A reserva vencida só era liberada quando alguém abria o detalhe do pedido; sem isso, o estoque ficava preso e o produto podia sumir do catálogo.

**Decisão técnica:**
O projeto não usa filas de tarefas (Celery) nem cron. A liberação das reservas vencidas é disparada nas próprias requisições de carrinho, checkout e catálogo, com um comando opcional para agendamento externo.

**Evidências (Pull Requests):**

_A adicionar._

**Pendências:**
- Implementação aguarda a confirmação de pagamento via webhook (O1, etapas 5 e 6) estar na `dev`.

**Evidências (prints):**

_A adicionar._
