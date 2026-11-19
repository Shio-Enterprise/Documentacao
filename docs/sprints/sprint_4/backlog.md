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

## Editar banners e frase da página inicial pelo painel admin

**Issue:** [#82 — [Feature] Editar banners e frase da página inicial pelo painel admin](https://github.com/Shio-Enterprise/Documentacao/issues/82)

**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)

**Sprint:** Sprint 4

**Tipo:** Feature

**Escopo:** Backend e Frontend

**Estado da issue:** fechada como concluída

### Descrição

O carrossel e a frase da faixa preta da página inicial eram fixos no código. A tarefa permite ao administrador cadastrar, editar, remover e reordenar banners, além de editar a frase pelo painel, para atualizar a loja sem publicar uma nova versão do site.

### Critérios de Aceitação

- O administrador adiciona, remove e reordena banners, com imagem para computador, imagem opcional para celular, texto alternativo e link opcional.
- O administrador edita a frase da faixa preta.
- O banner com link leva ao destino escolhido.
- A página inicial reflete as alterações após recarregar.
- Sem banners cadastrados, a loja mostra os banners padrão.
- Usuários sem login ou sem a permissão necessária não acessam a tela nem a API.
- Imagens acima do limite ou em formato inválido são recusadas com mensagem.

#### Evidências

- [Página de evidências](sprints/sprint_4/squad_3/edicao-banners-pagina-inicial-evidencias.md), com prints do painel, da loja e vídeo do carrossel com dois banners. A página distingue os critérios demonstrados daqueles sem comprovação nos arquivos fornecidos.

### Fora do escopo

- Edição de outras seções da página inicial.
- Agendamento de banners por data.

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


---

## Páginas institucionais e ajuda

**Issue:** [#83 — Completar o rodapé com conteúdo do cliente](https://github.com/Shio-Enterprise/Documentacao/issues/83)

**Escopo:** Frontend

**Status da entrega:** parcial — estrutura integrada, conteúdo oficial pendente.

O [PR #61 do frontend](https://github.com/Shio-Enterprise/frontend/pull/61) foi integrado à `dev`. As seis páginas estão disponíveis com textos de exemplo identificados como provisórios e imagens de campanha reutilizadas. O conteúdo aprovado, os contatos e os perfis sociais ainda dependem da Shio; a issue não é considerada concluída.

As [evidências locais de 18/11/2026](sprints/sprint_4/squad_1/paginas-institucionais-evidencias.md) registram as páginas em desktop e celular, a navegação do rodapé, os testes focados e as pendências de aceite.

---

## Edição completa do produto no painel admin

**Issue:** [#79 — [Melhoria] Editar produto por completo no painel admin (imagens, tamanhos e estoque)](https://github.com/Shio-Enterprise/Documentacao/issues/79)  
**Responsáveis:** [Matheus de Alcântara](https://github.com/matheusdealcantara), [Vilmar Fagundes](https://github.com/VilmarFagundes)  
**Sprint:** Sprint 4  
**Tipo:** Melhoria  
**Escopo:** Backend e Frontend  
**Status no quadro:** Done  

### Descrição

A tela de editar produto tinha menos informações que a de criar: não permitia alterar imagens, adicionar ou remover tamanhos nem ajustar o estoque de um tamanho específico. A edição virou uma página completa, no padrão do “Editar Drop”, com os mesmos campos da criação, além de imagens, tamanhos e estoque. Tamanhos com histórico são desativados em vez de apagados, e toda mudança de estoque continua passando pelo registro de movimentações.

### Critérios de Aceitação

- Admin edita as imagens de um produto existente: adiciona, substitui, remove e escolhe a principal.
- Admin adiciona, remove ou desativa e reativa tamanhos, inclusive convertendo a variação padrão “Único” em um tamanho real.
- Admin aumenta ou diminui o estoque de um tamanho pela quantidade final.
- Toda mudança de estoque feita pela edição aparece no histórico como “Ajuste”, com justificativa.
- Erros aparecem na tela com o motivo, por exemplo estoque negativo ou estoque alterado durante a edição.

#### Testes e Evidências

- Testes automatizados de ordem das imagens, desativação de tamanho, loja, carrinho, checkout, página de edição e envio de imagens, tamanhos e estoque.
- PRs [backend #52](https://github.com/Shio-Enterprise/backend/pull/52) e [frontend #60](https://github.com/Shio-Enterprise/frontend/pull/60), com CI aprovada e revisão de Matheus de Alcântara.
- [Página de evidências](sprints/sprint_4/squad_1/editar-produto-evidencias.md), com as regras, os resultados automatizados, a validação manual e os prints.

### Fora do escopo

- Edição de vários produtos de uma vez e mudanças em “Gerenciar estoque”.

---

## Criar novos administradores pelo painel

**Issue:** [#81 — [Feature] Criar novos administradores pelo painel](https://github.com/Shio-Enterprise/Documentacao/issues/81)  
**Responsáveis:** [Amanda Cruz](https://github.com/mandicrz), [Felipe Motta](https://github.com/M0tt1nh4), [Cauã Araujo](https://github.com/caua08)  
**Sprint:** Sprint 4  
**Tipo:** Feature  
**Escopo:** Backend e Frontend  
**Status no quadro:** Done  

### Descrição

A tela **Permissões** do painel deixava alterar o que cada administrador acessa, mas não deixava criar um administrador novo. Isso só era possível pelo admin do Django ou por comando no servidor, dependendo de um desenvolvedor. A atividade permite promover um cliente existente ou cadastrar uma conta nova já como administrador, escolhendo as permissões na criação, e remover o acesso de outro administrador.

### Critérios de Aceitação

- Admin com permissão promove um cliente existente a administrador.
- Admin com permissão cadastra uma conta nova de administrador; a pessoa recebe o e-mail para definir a senha.
- As permissões escolhidas na criação já valem no primeiro login.
- Admin com permissão remove o acesso de outro administrador.
- Admin sem permissão não vê a opção e recebe erro se tentar pela API.

#### Testes e Evidências

- Sem login `401`; sem permissão `403`; e-mail que já é admin recusado; não é possível remover o próprio acesso nem alterar superusuário; conta nova recebe o e-mail de definição de senha.
- PRs [backend #48](https://github.com/Shio-Enterprise/backend/pull/48) e [frontend #56](https://github.com/Shio-Enterprise/frontend/pull/56).
- [Página de evidências](sprints/sprint_4/squad_2/cadastro-administradores-evidencias.md).

### Fora do escopo

- Criar ou alterar superusuários pelo painel.

---

## Esconder a quantidade em estoque na página do produto

**Issue:** [#85 — [Melhoria] Esconder a quantidade em estoque na página do produto](https://github.com/Shio-Enterprise/Documentacao/issues/85)  
**Responsáveis:** [Amanda Cruz](https://github.com/mandicrz), [Felipe Motta](https://github.com/M0tt1nh4), [Cauã Araujo](https://github.com/caua08)  
**Sprint:** Sprint 4  
**Tipo:** Melhoria  
**Escopo:** Backend e Frontend  
**Status no quadro:** Done  

### Descrição

A página pública do produto mostrava quantas unidades existiam de cada tamanho. A pedido do cliente, essa quantidade passa a aparecer só para administradores, no painel. A API pública deixa de enviar o número exato e envia só se o tamanho está disponível, para que ele não fique visível nem inspecionando a página.

### Critérios de Aceitação

- Página do produto não mostra quantidade em estoque.
- Tamanho esgotado continua marcado como esgotado e com o "Avise-me".
- A resposta pública da API do produto não traz a quantidade exata.
- Painel admin continua mostrando as quantidades.
- Carrinho e checkout continuam impedindo comprar mais do que o estoque.

#### Testes e Evidências

- API pública do produto sem quantidade; API do admin com quantidade; tamanho com estoque 0 aparece como esgotado; adicionar ao carrinho mais que o estoque continua recusado.
- PRs [backend #49](https://github.com/Shio-Enterprise/backend/pull/49) e [frontend #57](https://github.com/Shio-Enterprise/frontend/pull/57).
- [Página de evidências](sprints/sprint_4/squad_2/estoque-oculto-evidencias.md).

### Fora do escopo

- Aviso de "últimas unidades".

---

## Máscaras de telefone e CPF

**Issue:** [#111 — [Melhoria] Máscaras de telefone e CPF](https://github.com/Shio-Enterprise/Documentacao/issues/111)  
**Responsáveis:** [Amanda Cruz](https://github.com/mandicrz), [Felipe Motta](https://github.com/M0tt1nh4), [Cauã Araujo](https://github.com/caua08)  
**Sprint:** Sprint 4  
**Tipo:** Melhoria  
**Escopo:** Backend e Frontend  
**Status no quadro:** Done  

### Descrição

Telefone e CPF eram digitados em Meus Dados sem formato definido, e o telefone seguia como veio até o pagamento na InfinitePay. A atividade mostra a máscara dos dois enquanto a pessoa digita, valida o telefone brasileiro no backend, grava só os dígitos, padroniza os telefones antigos por migração e envia o telefone à InfinitePay no formato `+55`.

### Critérios de Aceitação

- Telefone e CPF mostram a máscara enquanto a pessoa digita em Meus Dados.
- Telefone com `+55`, com ou sem pontuação, é aceito e gravado só com dígitos.
- Telefone inválido é recusado pela API com mensagem; celular sem o 9 tem mensagem própria.
- Telefones antigos válidos foram normalizados; os fora do padrão foram preservados.
- Salvar só o nome não apaga nem trava por telefone ou CPF antigo.
- Checkout fica bloqueado com telefone ausente ou inválido, e orienta a corrigir.
- O pagamento envia o telefone com `+55`.

#### Testes e Evidências

- Máscaras de telefone (celular, fixo, `+55`) e de CPF; gravação só com dígitos; erro de telefone inválido e de celular sem o 9; migração; bloqueio do pagamento e payload da InfinitePay com `+55`.
- PRs [backend #53](https://github.com/Shio-Enterprise/backend/pull/53) e [frontend #62](https://github.com/Shio-Enterprise/frontend/pull/62).
- [Página de evidências](sprints/sprint_4/squad_2/mascaras-telefone-cpf-evidencias.md).

### Fora do escopo

- Validação e normalização do CPF no backend (tratadas na issue #91).
- Telefones de outros países.
