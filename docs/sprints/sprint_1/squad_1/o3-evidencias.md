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

Catálogo mostrando produto de um drop em Rascunho (visível, mas com compra desabilitada):

![Produto de drop Rascunho visível no catálogo](../../../assets/evidencias-03/01-catalogo-drop-rascunho.png)

Página do produto com o botão desabilitado:

![Produto desabilitado](../../../assets/evidencias-03/produto_indisponivel.png)

Admin: formulário de criação de drop com os novos campos (visibilidade, data de encerramento, limite de unidades, banner):

![Formulário de criação de drop](../../../assets/evidencias-03/02-admin-novo-drop.png)

Admin: lista de drops com os status calculados (Rascunho, Programado, Ativo, Encerrado, Esgotado):

![Lista de drops com status](../../../assets/evidencias-03/03-admin-status-drops.png)