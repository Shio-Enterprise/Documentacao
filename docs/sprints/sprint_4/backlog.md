# Backlog da Sprint 4

## Visão Geral

Este documento consolida os itens da **Sprint 4** presentes no quadro Kanban do projeto **Shio**, registrando cada atividade.

---

## Responsividade e acessibilidade do site (WCAG 2.1 AA)

**Issue:** [#64 — [Melhoria] Responsividade e acessibilidade do site (WCAG 2.1 AA)](https://github.com/Shio-Enterprise/Documentacao/issues/64)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 4  
**Tipo:** Melhoria  
**Prioridade:** P2  
**Escopo:** Frontend  
**Status no quadro:** In progress  

### Descrição

Várias telas não funcionavam bem no celular, e havia problemas de acessibilidade: texto sem contraste, foco do teclado invisível, modais que não fechavam com Esc e carrossel sem pausa. A atividade deixa o site inteiro (loja, área do cliente e painel admin) responsivo e acessível no nível AA da WCAG 2.1, mantendo a identidade visual da Shio.

### Critérios de Aceitação

- Sem rolagem horizontal em 360, 768, 1024 e 1440 px, e zoom de 200% sem cortar conteúdo.
- Tudo funciona só com o teclado, com foco visível e ordem lógica.
- Áreas de toque de pelo menos 44 × 44 px no celular.
- Todo campo tem rótulo, e a mensagem de erro é ligada ao campo.
- Texto com contraste de pelo menos 4,5:1.
- Lighthouse de acessibilidade ≥ 90 e testes `vitest-axe` sem violações.

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

---

## Validação e padronização de CPF

**Issue:** [#91 — [Bug] CPF aceita número inválido e o mesmo CPF pode entrar em duas contas](https://github.com/Shio-Enterprise/Documentacao/issues/91)  
**Responsáveis:** [Matheus de Alcântara](https://github.com/matheusdealcantara), [Vilmar Fagundes](https://github.com/VilmarFagundes)  
**Sprint:** Sprint 4  
**Tipo:** Correção de bug  
**Prioridade:** P2  
**Escopo:** Backend e Frontend  
**Status no quadro:** In progress  

### Descrição

O perfil aceitava qualquer número com 11 dígitos e permitia cadastrar o mesmo CPF em contas diferentes ao alternar entre o formato com e sem pontuação. A correção valida os dígitos verificadores, padroniza o armazenamento e preserva os registros antigos que precisam de revisão pela equipe.

### Critérios de Aceitação

- Recusar CPF inválido e sequências repetidas, sem salvar os demais campos da requisição.
- Aceitar CPF válido com ou sem pontuação, gravar somente números e exibir o valor formatado.
- Recusar o CPF de outra conta, inclusive quando o registro antigo contém pontuação.
- Manter o CPF opcional no cadastro e permitir apagar o valor do perfil.
- Associar as mensagens de CPF inválido e CPF já cadastrado ao campo correspondente.
- Padronizar registros antigos válidos sem conflito e listar os inválidos e duplicados sem perder dados.
- Manter o envio do CPF aos Correios somente com números.

#### Testes e Evidências

- Testes automatizados de validação, atualização do perfil, duplicidade, migração, payload dos Correios e exibição do campo no frontend.
- PRs [backend #50](https://github.com/Shio-Enterprise/backend/pull/50) e [frontend #58](https://github.com/Shio-Enterprise/frontend/pull/58), com CI aprovada.
- [Página de evidências](sprints/sprint_4/squad_1/cpf-evidencias.md), com os resultados automatizados, a validação manual no Chrome e os prints.

### Fora do escopo

- Validação de CNPJ, consulta de titularidade à Receita e máscara automática durante a digitação.
