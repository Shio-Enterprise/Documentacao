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

---

## Remover a etapa de métodos de pagamento do checkout

**Issue:** sem issue  
**Responsáveis:** [Amanda Cruz](https://github.com/mandicrz), [Felipe Motta](https://github.com/M0tt1nh4), [Cauã Araujo](https://github.com/caua08)  
**Sprint:** Sprint 4  
**Tipo:** Melhoria  
**Escopo:** Frontend  
**Status no quadro:** Done  

### Descrição

O checkout tinha uma etapa "Pagamento" que só mostrava PIX e cartão, sem deixar escolher, porque a escolha é feita na página da InfinitePay. A atividade remove essa etapa, deixa o checkout com Entrega e Revisão e informa as duas formas de pagamento na Revisão.

### Critérios de Aceitação

- O checkout tem só as etapas Entrega e Revisão.
- A Revisão informa PIX e cartão em até 12x como formas de pagamento.
- A Revisão avisa que a escolha é feita na InfinitePay, depois de finalizar a compra.
- O foco e a contagem de etapas para leitores de tela seguem corretos.
- Finalizar a compra continua levando à InfinitePay.

#### Testes e Evidências

- Checkout em duas etapas; bloco de formas de pagamento na Revisão; foco no título da Revisão ao avançar; `vitest-axe` sem violações.
- PR do frontend: [[Fix] Retirando método de pagamento](https://github.com/Shio-Enterprise/frontend/pull/72).
- [Página de evidências](sprints/sprint_4/squad_2/metodos-pagamento-evidencias.md).

### Fora do escopo

- Mudanças no backend ou na integração com a InfinitePay.

## Registro e validação do consentimento de navegação

**Issue:** [#113 — [Melhoria] Registro do consentimento de navegação no backend](https://github.com/Shio-Enterprise/Documentacao/issues/113)  
**Responsável:** [Pedro Siqueira](https://github.com/PedroSiq)  
**Sprint:** Sprint 4  
**Tipo:** Melhoria  
**Prioridade:** P2  
**Escopo:** Frontend e Backend  
**Estado da issue:** fechada em 19/11/2026  
**Integração:** PRs abertos, não integrados à `dev` nem à `main` até o fim da sprint  

### Descrição

O banner "Sua privacidade" pedia o consentimento para registrar a navegação, mas a escolha ficava só no navegador. A loja não tinha como provar quem aceitou, quando e para qual texto, e limpar o navegador ou trocar de dispositivo apagava a escolha. A atividade registra a escolha no backend, com histórico e versão do texto do banner, leva essa escolha para a conta no login e anonimiza os eventos de quem recusa.

### Regras

- Cada escolha do banner (aceitar ou recusar) é registrada no backend com: conta ou identificador anônimo do navegador, escolha, versão do texto do banner e data.
- O histórico é mantido: uma mudança de escolha cria um novo registro, sem apagar o anterior. A escolha vigente é a mais recente.
- Um aceite só vale para a versão atual do texto do banner (ANALYTICS_CONSENT_VERSION). Se a versão mudar, o banner volta a aparecer.
POST /api/analytics/consent/ registra a escolha; GET /api/analytics/consent/ consulta a escolha vigente da conta ou do navegador.
- Ao recusar, os eventos já gravados da conta e do navegador se tornam anônimos (deixam de ter conta e identificador), sem alterar os totais do dashboard.
- No login, o histórico de consentimento do navegador passa para a conta junto com os eventos anônimos.
- A verificação no servidor (eventos e vínculo recusados sem aceite) fica atrás da flag ANALYTICS_CONSENT_ENFORCED, desligada por padrão. Com ela desligada, o comportamento é o mesmo de antes.
- No front, o banner registra a escolha no backend antes de enviar a página atual. Após o login, o front adota a escolha salva no backend; se não houver registro, envia a escolha local.
- Falhas na comunicação com o backend não aparecem para o usuário.


### Critérios de Aceitação

- Aceitar ou recusar no banner cria um registro no backend com versão e data.
- Mudanças de escolha mantêm o histórico; a consulta retorna a mais recente.
- Recusar anonimiza os eventos já gravados da pessoa, sem afetar eventos de outras pessoas.
- Após o login, a escolha salva na conta é aplicada no navegador e o banner não reaparece.
- O histórico aparece no admin do Django, sem edição.

#### Testes

- Registro de aceite e recusa, de visitante e de conta logada; identificador ausente recusado.
- Histórico com a escolha mais recente; consulta por conta e por navegador.
- Aceite de versão anterior não vale.
- Anonimização na recusa sem afetar outras pessoas.
- Flag desligada mantém o comportamento anterior; flag ligada recusa eventos e vínculo sem aceite.
- Testes de frontend do banner (registro antes do envio da página, falha do backend sem impedir a navegação, recusa registrada) e da sincronização no login antes do vínculo dos eventos.

#### Evidências

- PRs [backend #62](https://github.com/Shio-Enterprise/backend/pull/62) e [frontend #73](https://github.com/Shio-Enterprise/frontend/pull/73), com CI aprovada, ainda abertos e sem revisão.
- ![Registro e Consulta do Consentimento na API](../../../assets/evidencias-squad4/evidencias-consentimento/02-api-consentimento.png)
- ![Histórico de Consentimento no Admin](../../../assets/evidencias-squad4/evidencias-consentimento/03-admin-historico.png)
- ![CI dos PRs de Backend e Frontend](../../../assets/evidencias-squad4/evidencias-consentimento/04-ci.png)

### Fora do escopo

- Página de Política de Privacidade e Termos de uso.
- Revogar ou alterar a escolha pela Minha Conta.
- Banner por categorias de cookies (essenciais, analíticos, marketing).

---
## Vários guias de medidas e escolha do guia por produto

**Issue:** [#80 — [Feature] Vários guias de medidas e escolha do guia por produto](https://github.com/Shio-Enterprise/Documentacao/issues/80)  
**Responsável:** [João Gabriel](https://github.com/JoaoComTil)  
**Sprint:** Sprint 4  
**Tipo:** Feature  
**Escopo:** Backend e Frontend  
**Estado da issue:** fechada como concluída  

### Descrição

O guia de medidas era ligado à categoria (#74, #75), então todos os produtos de uma categoria usavam a mesma tabela. Dentro da mesma categoria, porém, existem modelagens diferentes, como uma camiseta normal e uma oversized. A atividade permite criar vários guias e escolher, em cada produto, qual guia ele usa, mantendo o guia da categoria como padrão.

### Regras

- O admin cria quantos guias quiser.
- No cadastro e na edição do produto, o admin escolhe o guia daquele produto numa lista.
- Sem guia escolhido, vale o guia da categoria; sem nenhum dos dois, a página fica como antes.
- Excluir um guia em uso deixa esses produtos sem guia próprio, e eles voltam a usar o da categoria.

### Critérios de Aceitação

- Admin cria mais de um guia para o mesmo tipo de roupa.
- Admin escolhe o guia no cadastro e na edição do produto.
- Dois produtos da mesma categoria mostram guias diferentes na loja.
- Produto sem guia escolhido continua mostrando o guia da categoria.
- A sugestão de tamanho usa o guia que está sendo mostrado.

#### Testes e Evidências

- Produto com guia próprio mostra o próprio; sem guia próprio, mostra o da categoria; excluir um guia em uso não gera erro e volta ao guia da categoria; o admin escolhe e remove o guia pela API; a tela de guias mostra quantos produtos usam cada um.
- PRs [backend #47](https://github.com/Shio-Enterprise/backend/pull/47) e [frontend #55](https://github.com/Shio-Enterprise/frontend/pull/55), com CI aprovada.
- [Página de evidências](sprints/sprint_4/squad_4/guias-por-produto-evidencias.md).

### Fora do escopo

- Medidas da peça (comprimento, manga), além das medidas do corpo.
- Guia diferente por cor ou variação do produto.

---

## Faixa de 10% de desconto clicável por inteiro

**Issue:** [#78 — [Melhoria] Faixa de cadastro com 10% de desconto clicável por inteiro](https://github.com/Shio-Enterprise/Documentacao/issues/78)  
**Responsáveis:** [João Gabriel](https://github.com/JoaoComTil), [João Lucas Ramos](https://github.com/Joaolramos)  
**Sprint:** Sprint 4  
**Tipo:** Melhoria  
**Escopo:** Frontend  
**Estado da issue:** fechada como concluída  

### Descrição

A faixa preta do topo só levava ao cadastro quando o cliente clicava exatamente em "Cadastre-se agora"; o resto da faixa não fazia nada. A pedido do cliente, a faixa inteira passou a levar à página de cadastro.

### Critérios de Aceitação

- Clicar em qualquer lugar da faixa abre a página de cadastro.
- Clicar no X fecha a faixa sem abrir o cadastro.
- A faixa pode ser ativada pelo teclado (Tab e Enter), como um link normal.
- Funciona no celular e no computador.

#### Testes e Evidências

- Clique na faixa navega para o cadastro; clique no X fecha a faixa e não navega; teste de acessibilidade (axe) da Navbar sem violações.
- PR [frontend #64](https://github.com/Shio-Enterprise/frontend/pull/64), com CI aprovada.
- [Página de evidências](sprints/sprint_4/squad_4/faixa-desconto-evidencias.md).

### Fora do escopo

- Mudar texto, cor ou o valor do desconto da faixa.

---

## Modal de boas-vindas em toda visita de usuário deslogado

**Issue:** [#114 — fix: modal de boas-vindas aparece a cada visita para usuário deslogado](https://github.com/Shio-Enterprise/Documentacao/issues/114)  
**Responsável:** [João Lucas Ramos](https://github.com/Joaolramos)  
**Sprint:** Sprint 4  
**Tipo:** Correção de bug  
**Escopo:** Frontend  

### Descrição

O modal de boas-vindas com 10% de desconto só voltava a aparecer um dia depois de ser fechado, porque a data do fechamento ficava salva no navegador. O visitante via a oferta uma vez e não a via mais. A correção remove essa espera, e o modal passa a aparecer em toda visita de quem não está logado.

### Critérios de Aceitação

- O modal aparece 3 segundos depois de abrir o site, para quem não está logado.
- Depois de fechado, o modal aparece de novo ao recarregar a página.
- Fechar o modal não salva nada no navegador.
- Usuário logado não vê o modal.

#### Testes e Evidências

- 4 testes do `WelcomeModal` ajustados para o novo comportamento; 9 de 9 passando.
- PR [frontend #74](https://github.com/Shio-Enterprise/frontend/pull/74), com CI aprovada.
- [Página de evidências](sprints/sprint_4/squad_4/modal-boas-vindas-evidencias.md).

---
