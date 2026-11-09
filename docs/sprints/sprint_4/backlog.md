# Backlog da Sprint 4

## Visão Geral

Este documento consolida os itens da **Sprint 4** presentes no quadro Kanban do projeto **Shio**, registrando cada atividade.

---

## Galeria de miniaturas da página do produto

**Issue:** [#84 — [Melhoria] Ajustar a galeria de miniaturas da página do produto](https://github.com/Shio-Enterprise/Documentacao/issues/84)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 4  
**Tipo:** Melhoria  
**Escopo:** Frontend  
**Status no quadro:** In progress  

### Descrição

Na página do produto, a coluna de miniaturas ao lado da foto principal não acompanhava o formato das imagens nem a quantidade de fotos. Com poucas fotos sobrava espaço. Com muitas, a coluna ficava mais alta que a foto principal, que esticava e cortava a imagem, perdendo o formato quadrado. Pedido do cliente: a galeria deve manter alinhamento, proporção e organização, qualquer que seja o número de fotos.

### Regras

- A foto principal é sempre quadrada, e a imagem não é cortada nem esticada.
- A coluna de miniaturas tem a mesma altura da foto principal. Se as miniaturas não couberem, a coluna rola com setas, sem empurrar o resto da página.
- Miniaturas sempre quadradas, do mesmo tamanho e alinhadas.
- Com uma foto só, a coluna de miniaturas não aparece.
- No celular, as miniaturas ficam numa linha abaixo da foto principal, com rolagem lateral.

### Critérios de Aceitação

- Galeria alinhada e proporcional com 1, 3, 5 e 10 fotos.
- Foto principal quadrada em todas as larguras de tela.
- Miniatura selecionada continua destacada; trocar de foto funciona por clique e teclado.
- Prints de antes e depois no PR (computador e celular).

#### Testes

- Produto com 1 foto e com muitas fotos renderiza sem quebrar o layout.
- Clicar numa miniatura troca a foto principal.

### Fora do escopo

- Zoom na foto e visualização em tela cheia.
