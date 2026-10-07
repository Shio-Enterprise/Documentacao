## Checkout com cupom
**Trio:** João Gabriel e João Reis

**Origem:**
- [Issue #45](https://github.com/Shio-Enterprise/Documentacao/issues/45) — corrigir a linha de desconto enviada à InfinitePay.
- [Issue #46](https://github.com/Shio-Enterprise/Documentacao/issues/46) — modelo de cupom com limites, escopo e contagem de usos.
- [Issue #47](https://github.com/Shio-Enterprise/Documentacao/issues/47) — validar o cupom digitado e aplicá-lo na cotação e no checkout.
- [Issue #48](https://github.com/Shio-Enterprise/Documentacao/issues/48) — campo de cupom de desconto no checkout (frontend).
- [Issue #49](https://github.com/Shio-Enterprise/Documentacao/issues/49) — CRUD de cupons no painel administrativo.

**Por que a melhoria foi relevante?**
Só o cupom BEMVINDO10 funcionava, aplicado automaticamente na primeira compra e com a regra fixa no código. A loja não tinha como fazer campanhas com cupom (por drop, por categoria, com limite de usos ou para parceiros como a Méliuz), e a equipe dependia de um desenvolvedor para qualquer desconto novo.

**Decisões técnicas:**
- O modelo `Coupon` existente foi estendido em vez de criar outro, porque pedido, cotação e dashboard já apontam para ele.
- O uso de um cupom é derivado dos próprios pedidos, sem contador separado: quando um pedido é cancelado, inclusive por reserva vencida, o uso volta sozinho.
- Pedido aguardando pagamento com a reserva vencida continua contando como uso até ser cancelado, para que o cliente não consiga usar o mesmo cupom de novo e depois pagar o link antigo.
- O código do cupom é guardado sempre em maiúsculas, garantido por constraint no banco, e o código digitado é normalizado antes da busca.
- O cupom digitado é validado na cotação e revalidado com trava no checkout, para que compras simultâneas não ultrapassem o limite de usos.

**Regras:**
- Um cupom por pedido; o código digitado substitui o desconto automático.
- O cupom vale também para itens em promoção.
- O valor mínimo é comparado com o subtotal, sem frete.
- O desconto incide só sobre os itens do escopo do cupom; o desconto fixo nunca passa do valor desses itens.
- Cupom inválido recusa a cotação com a mensagem do motivo.
- Cupom já usado não pode ter o código alterado nem ser apagado, só desativado.

**Evidências (Pull Requests):**

_A adicionar._

**Pendências:**
- Integração do cupom na cotação e no checkout (#47) e correção da linha da InfinitePay (#45) aguardam a confirmação de pagamento via webhook (O1, etapas 5 e 6) estar na `dev`.
- Validar em sandbox que a InfinitePay aceita a linha de desconto no cartão e no PIX.
- Integração com a Méliuz depende de contato comercial.

**Evidências (prints):**

_A adicionar._
