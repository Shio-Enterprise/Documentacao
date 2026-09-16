## Checkout seguro com cálculo autoritativo, cotação persistida e idempotência
**Trio:** Amanda, Felipe e Cauã

**Por que a melhoria foi relevante?**

O checkout confiava em valores financeiros enviados pelo frontend, permitindo que frete e total fossem alterados pelo cliente. Além disso, uma cotação poderia deixar de representar o carrinho atual e requisições repetidas poderiam iniciar mais de uma tentativa para a mesma compra. A O1 centralizou no backend o cálculo de subtotal, frete, desconto e total, passou a persistir cotações vinculadas ao usuário, endereço e conteúdo do carrinho, com prazo de validade, e adotou uma chave de idempotência no checkout. No frontend, a finalização passou a depender de uma cotação válida, enquanto valores expirados ou desatualizados bloqueiam a compra e exigem novo cálculo. Com isso, o pedido usa uma única fonte de verdade para os valores e reduz o risco de manipulação e duplicidade.

**Evidências (Pull Requests):**
- [Frontend PR #12](https://github.com/Shio-Enterprise/frontend/pull/12)
- [Backend PR #11](https://github.com/Shio-Enterprise/backend/pull/11)

**Evidências (Prints):**

Resposta da cotação com subtotal, frete, desconto e total calculados pelo backend:

![Resposta com valores calculados pelo backend](../../../assets/evidencias-o1/etapa1-calculo-no-backend.png)

Tentativa de enviar `shipping_cost` e `total_amount` adulterados rejeitada pela API:

![Checkout rejeitando valores manipulados](../../../assets/evidencias-o1/etapa1-valores-manipulados-rejeitados.png)

Cotação registrada antes da alteração do carrinho, com uma unidade do produto:

![Cotação antes da alteração do carrinho](../../../assets/evidencias-o1/etapa2-cotacao-antes.png)

Nova cotação criada após a mudança de quantidade, refletindo o novo subtotal e total:

![Nova cotação depois da alteração do carrinho](../../../assets/evidencias-o1/etapa2-cotacao-depois.png)

Tentativa de finalizar a compra com a cotação anterior rejeitada porque o carrinho foi alterado:

![Checkout rejeitando cotação anterior](../../../assets/evidencias-o1/etapa2-cotacao-antiga-rejeitada.png)

Frontend bloqueando a finalização após a expiração da cotação e oferecendo o recálculo:

![Frontend bloqueado até o recálculo da cotação](../../../assets/evidencias-o1/etapa3-cotacao-expirada-no-frontend.png)

Payload do checkout contendo apenas `address_id`, `shipping_quote_id` e `idempotency_key`, sem valores financeiros calculados pelo cliente:

![Payload do checkout sem valores financeiros enviados pelo frontend](../../../assets/evidencias-o1/etapa3-payload-checkout.png)
