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

## Envio de cupom por e-mail para clientes

**Issue:** [#67 — [Feature] Envio de cupom por e-mail para clientes](https://github.com/Shio-Enterprise/Documentacao/issues/67)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 3  
**Tipo:** Nova funcionalidade  
**Prioridade:** P2  
**Escopo:** Frontend e Backend  
**Status no quadro:** Em revisão (PRs abertos)  

### Descrição

O admin já criava cupons, mas o cupom só chegava ao cliente se a loja divulgasse por fora. A atividade permite enviar um cupom por e-mail, logo depois de criá-lo ou quando o admin quiser, para quem já comprou ou aceitou receber promoções, com aceite no cadastro e em "Minha conta" e descadastro por link.

### Regras

- Recebem clientes que já compraram e quem aceitou receber promoções; ficam de fora os que pediram para sair.
- Cupom inativo, vencido ou esgotado não pode ser enviado.
- Pré-visualização, envio de teste para o admin e confirmação antes do envio real.
- Um e-mail por pessoa, com link "Não quero receber promoções" que funciona sem login.
- Histórico de envios por cupom.
- Caixa de aceite no cadastro desmarcada por padrão (LGPD).

### Critérios de Aceitação

- Admin envia um cupom pelo aviso após a criação ou pelo menu Ações.
- Pré-visualização e envio de teste funcionam antes do envio real.
- Só quem comprou ou aceitou recebe; quem se descadastrou deixa de receber.
- Cupom inativo ou vencido não pode ser enviado.
- Histórico aparece no cupom.
- O endereço de um cliente nunca aparece para outro.

#### Testes

- Cliente sem aceite e sem compra não recebe; descadastrado não volta a receber ao comprar.
- Link de descadastro adulterado não altera nada.
- Usuário sem permissão de admin recebe `403`.
- Falha no envio para um cliente não interrompe os demais.

---
