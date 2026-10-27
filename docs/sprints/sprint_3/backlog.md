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
**Status no quadro:** DoD  

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

## "Avise-me quando chegar" para tamanho esgotado

**Issue:** [#66 — [Feature] "Avise-me quando chegar" para tamanho esgotado](https://github.com/Shio-Enterprise/Documentacao/issues/66)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 3  
**Tipo:** Nova funcionalidade  
**Prioridade:** P2  
**Escopo:** Frontend e Backend  
**Status no quadro:** DoD  

### Descrição

Quando um tamanho esgotava, o cliente não tinha como saber quando ele voltava, e a loja perdia a venda. A atividade adiciona o botão "Avise-me quando chegar" nos tamanhos esgotados: o cliente logado pede o aviso e recebe um e-mail quando o tamanho volta a ser vendido. Os pedidos ficam em "Meus avisos", onde podem ser cancelados.

### Regras

- O aviso vale por variação (tamanho/cor), e só para cliente logado.
- Dispara quando o estoque passa de 0 para mais de 0 ou quando o produto volta a ser vendável.
- Produto inativo ou drop fechado não dispara; os pedidos continuam aguardando.
- Cada pedido recebe um e-mail só; depois de avisado, é encerrado.
- O e-mail avisa que não há reserva: quem comprar primeiro leva.

### Critérios de Aceitação

- Tamanho esgotado mostra "Avise-me quando chegar" no lugar de "Adicionar ao carrinho".
- Pedido duplicado para o mesmo tamanho não cria um segundo aviso.
- Reposição (0 → maior que 0) envia o e-mail para todos os pedidos pendentes daquele tamanho.
- O mesmo pedido não recebe um segundo e-mail na próxima reposição.
- "Meus avisos" lista os pedidos, permite cancelar os pendentes e mostra a data do aviso.

#### Testes

- Estoque que vai de 3 para 5 não dispara aviso.
- Reposição de outro tamanho não avisa quem pediu este.
- Falha no envio para uma pessoa não impede o envio para as demais.
- Dois envios simultâneos resultam em um e-mail só por pedido (PostgreSQL).

---

## Guia de medidas por categoria na página do produto

**Issue:** [#74 — [Feature] Guia de medidas por categoria na página do produto](https://github.com/Shio-Enterprise/Documentacao/issues/74)  
**Responsável:** [João Gabriel](https://github.com/JoaoComTil)  
**Sprint:** Sprint 3  
**Tipo:** Nova funcionalidade  
**Escopo:** Frontend e Backend  
**Status no quadro:** DoD  

### Descrição

A página do produto mostrava só os nomes dos tamanhos, sem dizer a que medidas cada um corresponde, e o cliente escolhia o tamanho no escuro, o que gera trocas. A atividade adiciona um guia de medidas por categoria de roupa: a página do produto mostra a tabela (P/M/G/GG, de PP a XG) com as medidas do corpo em centímetros e uma calculadora que sugere o tamanho a partir da medida do cliente.

### Regras

- O guia é ligado à categoria; produtos de categoria sem guia não mostram a tabela.
- Guias padrão "Parte de cima" (tórax, cintura e quadril) e "Parte de baixo" (cintura e quadril), editáveis no admin do Django.
- Medidas do corpo, em faixas de centímetros; entre dois tamanhos, sugere o maior.
- No cadastro de produto, os tamanhos são escolhidos numa lista (PP a XG ou Único) e a categoria é escolhida já na criação.

### Critérios de Aceitação

- A página de um produto de categoria com guia mostra a tabela de medidas.
- O cliente digita uma medida e recebe a sugestão de tamanho; fora da tabela, recebe o tamanho mais próximo.
- O admin ajusta as medidas e liga categorias a guias sem mudança de código.
- Produto de categoria sem guia continua com a página como antes.

#### Testes

- Detalhe do produto com e sem guia, sem consulta extra ao banco.
- Validação recusa faixa invertida, medida faltando e tamanhos fora de ordem.
- Sugestão de tamanho dentro da faixa, na fronteira, entre faixas e fora da tabela.
- Lista de tamanhos e categoria enviadas corretamente no cadastro.

---
