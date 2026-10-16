# Backlog da Sprint 3

## Visão Geral

Este documento consolida os itens da **Sprint 3** presentes no quadro Kanban do projeto **Shio**, registrando cada atividade.

---

## Exportação de dados do painel admin em CSV e Excel

**Issue:** [#62 — [Feature] Exportação de dados do painel admin em CSV e Excel](https://github.com/Shio-Enterprise/Documentacao/issues/62)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 3  
**Tipo:** Nova funcionalidade  
**Prioridade:** P2  
**Escopo:** Frontend e Backend  
**Status no quadro:** In progress  

### Descrição

O painel administrativo não permitia exportar dados. Para contabilidade, conferência de pedidos, campanhas com a lista de clientes ou controle de estoque fora do sistema, o administrador precisava copiar as informações da tela. A atividade adiciona exportação em CSV e Excel (.xlsx) nas telas de Pedidos, Clientes e Estoque.

### Regras

- Exportação disponível em Pedidos, Clientes e Estoque, em CSV ou Excel (.xlsx).
- O arquivo respeita a busca aplicada na tela, com o mesmo critério de busca da tela.
- Cada exportação exige a mesma permissão administrativa da tela correspondente.
- Datas no fuso America/Sao_Paulo; valores monetários em reais.
- Textos iniciados por `=`, `+`, `-` ou `@` são neutralizados para impedir injeção de fórmula.

### Critérios de Aceitação

- Administrador exporta pedidos, clientes e estoque em CSV e em Excel.
- O arquivo exportado traz o mesmo resultado da busca aplicada na tela.
- O CSV abre no Excel com acentuação correta e colunas separadas.
- O Excel abre com valores monetários e datas formatados e permite somar e filtrar.
- Administrador sem a permissão da área não consegue exportar.
- O botão mostra carregamento e mensagem de erro em caso de falha.

#### Testes

- `401` para anônimo, `403` para administrador sem permissão da área, `200` com permissão.
- Content-type correto para CSV e XLSX; formato inválido retorna `400`.
- Cabeçalho e valores corretos (XLSX validado com `openpyxl`).
- Busca aplicada altera o conteúdo exportado.
- Acentuação/BOM corretos no CSV.

---
