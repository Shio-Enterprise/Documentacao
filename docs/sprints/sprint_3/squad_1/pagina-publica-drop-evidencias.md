# Página pública do drop (`/drop/:slug`)

**Dupla:** Matheus de Alcântara e Vilmar Fagundes

**Origem:**
- [Issue #70](https://github.com/Shio-Enterprise/Documentacao/issues/70): página pública do drop, com URL amigável, contagem regressiva e unidades restantes.

## Contexto e Relevância

O `DropCampaign` já guardava banner, data de lançamento, data de fim e limite de unidades. Mesmo assim, não existia uma página para o cliente ver o drop: o único detalhe público era por UUID, sem URL amigável, sem filtrar os produtos visíveis e sem contar quantas unidades restavam. Com esta entrega, cada drop tem uma página própria em **`/drop/:slug`**. A página mostra o banner, uma **contagem regressiva** até o lançamento ou até o fim, o contador **"X de Y restantes"** e os produtos do drop, com o mesmo card do catálogo.

---

## Regras e Especificações Implementadas

1. **URL amigável**: o drop é acessado pelo `slug`, por exemplo `/drop/colecao-inverno`, e não pelo UUID.
2. **Fase do drop**, calculada pelo horário atual:
   - **Em breve**: antes do `launch_date`. Mostra a contagem regressiva até o lançamento.
   - **Ao vivo**: entre o lançamento e o `end_date`. Mostra a contagem até o fim, quando o drop tem data de fim.
   - **Encerrado**: depois do `end_date`, ou quando o admin desativou o drop (`is_active=False`). Não mostra contagem.
3. **Contagem ao vivo**: atualiza a cada segundo, em dias, horas, minutos e segundos, sem recarregar a página.
4. **Unidades restantes**:
   - quando o drop tem limite (`max_quantity`), mostra "X de Y restantes";
   - quando o drop não tem limite, o contador não aparece;
   - contam como vendidas as unidades de pedidos não cancelados;
   - o número restante nunca fica negativo.
5. **Esgotado**: com o drop ao vivo e zero unidades restantes, aparece o selo "Esgotado".
6. **Produtos**:
   - só aparecem os produtos ativos do drop, em ordem alfabética;
   - o card é o mesmo do catálogo público;
   - produto não vendável aparece como indisponível, usando o `is_sellable` de cada produto.
7. **Visibilidade**: drop privado (`is_public=False`) ou slug inexistente mostra "Drop não encontrado." Isso vale até para administradores. Para pré-visualizar um drop privado, continua valendo o detalhe por UUID.
8. **Acesso à página**:
   - pelo texto "Drop: {nome}" na página do produto;
   - por "Ver página pública" no menu de ações da lista de drops do admin;
   - pelo botão "Ver página pública" no detalhe do drop do admin.

---

## Endpoints do Backend

- `GET /api/catalog/drops/slug/<slug>/` (público): detalhe do drop para a página pública. Responde 404 para slug inexistente ou drop privado. Além dos campos do drop, traz:
  - `products`: produtos ativos, no formato de card do catálogo, com imagens, variações e `is_sellable`;
  - `sold_quantity`: unidades vendidas;
  - `remaining_quantity`: unidades restantes, ou `null` quando o drop não tem limite.

Arquivos principais:
- `products/views.py`: `PublicDropCampaignView`.
- `products/serializers.py`: `PublicDropCampaignSerializer`, que reaproveita o `ProductListSerializer` do catálogo e o `get_drop_sold_quantity` de `products/availability.py`.
- `products/urls.py`: rota `drop-public-detail`.

---

## Componentes do Frontend

- **`DropPage`** (`/drop/:slug`, rota pública):
  - banner, nome e descrição;
  - selos "Em breve", "Encerrado", "Esgotado" e "X de Y restantes";
  - contagem regressiva;
  - grade de produtos com o `ProductCard`;
  - estados de carregamento, "Drop não encontrado." e "Nenhum produto publicado neste drop ainda."
- **`src/lib/dropCountdown.js`**: funções puras `getCountdownParts`, que divide o tempo restante, e `getDropPhase`, que decide entre em breve, ao vivo e encerrado. Ficam separadas da página para serem testadas sem montar componente.
- **`src/hooks/useNow.js`**: horário atual, atualizado a cada segundo.
- **Links para a página**: `ProductDetailPage` ("Drop: {nome}"), `DropsPage` e `DropDetailsPage` do admin ("Ver página pública").

---

## Evidências (Pull Requests)

- [Backend PR #36](https://github.com/Shio-Enterprise/backend/pull/36)
- [Frontend PR #32](https://github.com/Shio-Enterprise/frontend/pull/32)

---

## Validação Automatizada

### Backend (Pytest)
- **`products/test_public_drop.py`** (10 testes):
  - **Acesso**:
    - visitante anônimo vê o drop pelo slug;
    - slug inexistente responde 404;
    - drop privado responde 404 para visitante e também para admin.
  - **Produtos**:
    - só lista os produtos ativos do drop;
    - o produto vem no formato de card do catálogo.
  - **Unidades restantes**:
    - sem `max_quantity`, `remaining_quantity` é `null`;
    - desconta as unidades vendidas;
    - pedido cancelado não conta como vendido;
    - não fica negativo quando as vendas passam do limite.

### Frontend (Vitest & Testing Library)
- **`src/pages/public/DropPage/index.test.jsx`** (8 testes):
  - carregamento e depois o drop;
  - "não encontrado" quando o backend responde 404;
  - antes do lançamento: "Em breve" e contagem até o lançamento;
  - durante o drop: contador de restantes e contagem até o fim;
  - depois do fim: "Encerrado", sem contagem;
  - "Esgotado" com zero unidades e o drop ainda no ar;
  - produtos do drop, com os indisponíveis marcados;
  - aviso de drop sem produtos.
- **`src/lib/dropCountdown.test.js`** (9 testes):
  - **`getCountdownParts`**: sem data, data passada e divisão em dias, horas, minutos e segundos.
  - **`getDropPhase`**:
    - em breve antes do lançamento, mesmo com `is_active=False`;
    - ao vivo dentro da janela e sem `end_date`;
    - encerrado depois do fim ou desativado pelo admin;
    - ao vivo sem nenhuma data.

O CI (GitHub Actions) passou nos dois PRs.

---

## Limitações Conhecidas

- A fase e a contagem usam o relógio do navegador do cliente. Se o relógio estiver errado, a contagem também fica.
- A página não atualiza sozinha as unidades restantes. O número é o do momento em que a página foi carregada.
- A trava real de limite continua no checkout (`is_drop_sellable`). O contador da página é só informativo.

---

## Evidências (prints)

<!--
Adicionar os prints em docs/assets/evidencias-pagina-drop/ e descomentar:

Drop antes do lançamento, com "Em breve" e a contagem regressiva:

![Drop em breve](../../../assets/evidencias-pagina-drop/01-drop-em-breve.png)

Drop ao vivo, com "X de Y restantes", contagem até o fim e os produtos:

![Drop ao vivo](../../../assets/evidencias-pagina-drop/02-drop-ao-vivo.png)

Drop esgotado:

![Drop esgotado](../../../assets/evidencias-pagina-drop/03-drop-esgotado.png)

Drop encerrado, sem contagem:

![Drop encerrado](../../../assets/evidencias-pagina-drop/04-drop-encerrado.png)

Drop privado ou slug inexistente:

![Drop não encontrado](../../../assets/evidencias-pagina-drop/05-drop-nao-encontrado.png)

Link "Ver página pública" no admin:

![Link no admin](../../../assets/evidencias-pagina-drop/06-admin-ver-pagina-publica.png)
-->
