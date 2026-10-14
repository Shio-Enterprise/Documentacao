# Exportação de Dados do Painel Administrativo

**Trio:** Ian Costa, Arthur Sousa e Danilo Naves

## Contexto e Relevância

Antes desta funcionalidade, o painel administrativo não permitia exportar dados operacionais e analíticos. Para fins de contabilidade, conciliação de pedidos, campanhas com a lista de clientes ou controle de estoque fora da plataforma, os administradores precisavam copiar as informações manualmente tela a tela.

Esta melhoria implementou a exportação estruturada em **CSV** e **Excel (.xlsx)** nas telas de **Pedidos**, **Clientes (CRM)** e **Estoque/Catálogo**, reaproveitando integralmente as consultas, ordenações, buscas e permissões de acesso já existentes no sistema.

---

## Regras e Especificações Implementadas

1. **Formatos suportados**:
   - **CSV**: codificado em UTF-8 com BOM (`\ufeff`), delimitador ponto e vírgula (`;`), quebra de linha `\r\n` para abertura imediata no Microsoft Excel (pt-BR) com caracteres e acentuações corretas.
   - **Excel (.xlsx)**: gerado nativamente via `openpyxl`, com cabeçalho em negrito, primeira linha congelada (`freeze_panes = 'A2'`), largura de colunas ajustada automaticamente, valores monetários formatados como moeda (`R$ #,##0.00`) e datas formatadas no fuso horário `America/Sao_Paulo`.
2. **Proteção contra injeção de fórmula (CSV / Formula Injection)**:
   - Todo campo textual que se inicia por `=`, `+`, `-` ou `@` é sanitizado recebendo o prefixo `'` para impedir execução inadvertida de macros ou fórmulas arbitrárias ao abrir a planilha.
3. **Respeito aos filtros aplicados em tela**:
   - O arquivo exportado reflete os filtros de status, buscas textuais e ordenações ativos no momento do download.
4. **Controle de acesso por permissão administrativa**:
   - Cada exportação exige a mesma permissão administrativa da tela correspondente:
     - Pedidos: `CanManageOrders`
     - Clientes: `CanManageCustomers`
     - Estoque: `CanManageCatalog`

---

## Colunas Exportadas

- **Pedidos:** Número, Data, Cliente, E-mail, Itens (resumo das peças e variações), Subtotal, Desconto/Cupom, Frete, Total, Status do Pedido, Status do Pagamento.
- **Clientes:** Nome, E-mail, Data de Cadastro, Pedidos Concluídos, Total Gasto, Última Compra, Inscrito na Newsletter.
- **Estoque:** Produto, Drop, Categoria, Tamanho, Cor, Quantidade em Estoque, Preço de Custo, Preço de Venda.

---

## Endpoints do Backend

- `GET /api/orders/admin/export/` — Exportação de pedidos filtrados por `status`, `search` e `file_format`.
- `GET /api/auth/crm/customers/export/` — Exportação de clientes via `@action` no `CustomerCRMViewSet`, com filtros de busca e ordenação.
- `GET /api/catalog/inventory/export/` — Exportação de estoque/variações de catálogo filtrados por `search`, `drop`, `category` e `file_format`.
- `backend/core/exports.py` — Helper centralizado de exportação e neutralização de fórmulas.

---

## Componentes do Frontend

- `src/lib/downloadFile.js` — Helper baseado em `apiClient` com `responseType: 'blob'`, extração de nome do arquivo via cabeçalho `Content-Disposition` (RFC 5987 / UTF-8) e disparo seguro de download no navegador.
- `src/components/admin/ExportButton.jsx` — Botão reutilizável com menu suspenso "CSV" / "Excel (.xlsx)", estado de carregamento com bloqueio de múltiplos cliques e mensagem de erro acessível (`role="alert"`).
- Integrado nas telas:
  - `OrdersPage` (`/admin/orders`)
  - `CustomersPage` (`/admin/customers`)
  - `ProductsPage` (`/admin/products`)

---

## Validação Automatizada

### Backend (Pytest)
- **`core/test_exports.py`**:
  - Validação da neutralização de prefixos de fórmula (`=`, `+`, `-`, `@`).
  - Validação da conversão de fuso horário para `America/Sao_Paulo`.
  - Validação de resposta `400 Bad Request` para formato inválido.
  - Validação de geração de CSV com BOM e separador `;`.
  - Validação de geração de XLSX (freeze panes, fontes em negrito, máscara de moeda e data).
- **`orders/test_exports.py`**:
  - `401` para requisições anônimas, `403` sem permissão `manage_orders` e `200` com permissão.
  - Filtro por status (`?status=PAID`) e busca textual.
  - Validação do XLSX gerado via `openpyxl.load_workbook`.
- **`authentication/test_exports.py`**:
  - `401` anônimo, `403` sem `manage_customers`, `200` com permissão.
  - Verificação de inscrição na newsletter ("Sim" / "Não").
  - Filtro por busca de clientes.
- **`products/test_exports.py`**:
  - `401` anônimo, `403` sem `manage_catalog`, `200` com permissão.
  - Filtro por drop e busca textual por SKU/nome.

### Frontend (Vitest & Testing Library)
- **`downloadFile.test.js`**:
  - Requisição com `responseType: 'blob'`, parse de `Content-Disposition` e acionamento de download no DOM.
- **`ExportButton.test.jsx`**:
  - Renderização do menu, disparos de exportação em CSV e XLSX com parâmetros preservados, estado de carregamento e mensagem de erro.
- **`OrdersPage.test.jsx`**, **`CustomersPage.test.jsx`**, **`ProductsPage.test.jsx`**:
  - Presença e integração do botão de exportação nas páginas.
