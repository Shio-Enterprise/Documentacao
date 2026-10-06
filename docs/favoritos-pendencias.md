# Favoritos — validação e pendências da implementação

**Data:** 5 de outubro de 2026  
**Referência:** [Issue #37 — Favoritos de produtos com lista em Minha conta](https://github.com/Shio-Enterprise/Documentacao/issues/37)  
**Escopo:** código local de backend e frontend, testes, build e documentação.

## Parecer

A estrutura principal da funcionalidade está implementada: modelo, migration, API autenticada, coração compartilhado e página privada da conta. Ainda não considero a entrega concluída.

Foi reproduzido um defeito de sincronização entre a listagem retornada pelo servidor e o cache de IDs do frontend. Também faltam testes de regressão para os mecanismos de sessão introduzidos, uma verificação integrada com a API real e correções nos apontamentos de lint acrescentados pela alteração.

Esta validação não modificou o código funcional. As correções descritas abaixo permanecem pendentes. Os resultados substituem os relatos parciais anteriores dos subagentes quando houver divergência.

## 1. O que já está implementado

| Área | Implementação encontrada | Evidência no código |
| --- | --- | --- |
| Persistência | `Wishlist` com UUID, usuário, produto, data, unicidade por par e exclusão em cascata | `backend/products/models.py`, `products/migrations/0007_wishlist.py` |
| API | Listagem paginada, inclusão idempotente, remoção idempotente pelo produto e consulta de todos os IDs visíveis | `backend/products/views.py`, `products/urls.py` |
| Autorização | Quatro operações autenticadas e consultas limitadas ao usuário atual | `WishlistListCreateView`, `WishlistIdsView`, `WishlistDeleteView` |
| Visibilidade | Produtos inativos e de drops privados omitidos; vínculos preservados; produtos sem estoque continuam na lista | `wishlist_products_queryset()` e testes de API |
| Contrato | Serialização dos produtos e descrições OpenAPI para respostas e paginação | `backend/products/serializers.py`, `products/views.py` |
| Coração | Botão separado do link, estado marcado, bloqueio durante envio, nome acessível e `aria-pressed` | `frontend/src/components/ui/ShioDesign.jsx` |
| Estado compartilhado | Consulta inicial de IDs, bloqueio de operações repetidas por produto e atualização após mutações confirmadas | `frontend/src/context/WishlistContext.jsx` |
| Conta | Rota privada `/my-favorites`, menu desktop/mobile, paginação, erro, nova tentativa e lista vazia | `frontend/src/routes/index.jsx`, `AccountLayout.jsx`, `MyFavoritesPage/index.jsx` |
| Sessão | Contexto recriado por sessão, descarte de respostas antigas, limpeza no logout e temporizador de expiração | `WishlistContext.jsx`, `AuthContext.jsx` |
| Login | Retorno à localização de origem, incluindo query string e fragmento | `frontend/src/pages/user/LoginPage/index.jsx` |

Não é necessário criar outra tabela, outro fluxo de autenticação ou uma nova página para cumprir a proposta. As pendências concentram-se em corrigir a sincronização existente e concluir sua validação.

## 2. Correção funcional necessária

### P2 — A lista atualizada do servidor pode ser escondida por IDs antigos

**Status:** defeito confirmado por execução no navegador.

**Arquivos envolvidos:**

- `frontend/src/context/WishlistContext.jsx`: consulta os IDs no início da sessão e os atualiza pelas operações locais; a navegação para a página de favoritos não reconcilia automaticamente esse conjunto.
- `frontend/src/pages/user/MyFavoritesPage/index.jsx:59`: filtra os produtos da resposta paginada usando `ids.has(product.id)`, mesmo quando esses IDs são anteriores à resposta da listagem.

**Reprodução:**

1. Entrar com uma conta que tem um produto favoritado atualmente oculto. A consulta de IDs retorna uma lista vazia.
2. Tornar o produto público novamente, mantendo a sessão aberta. Outra forma de atingir o estado é adicionar um favorito em outro navegador da mesma conta.
3. Navegar para fora e voltar a “Meus favoritos”, sem recarregar a aplicação inteira.
4. A consulta paginada retorna `count: 1` e o produto em `results`.
5. O filtro local remove esse produto porque o cache não contém seu ID.

**Resultado observado:** contador “1 item”, nenhum card e mensagem “Você ainda não tem favoritos”. A reprodução simulou as respostas HTTP para controlar a mudança de visibilidade; não alterou dados reais.

**Impacto:** a interface contradiz a resposta atual do servidor e a regra de reaparecimento de produtos restaurados. Um favorito adicionado fora da aba atual também pode ficar invisível ao entrar na página.

**Implementação necessária:** estabelecer uma reconciliação entre a resposta paginada e o conjunto compartilhado. A página não deve descartar uma resposta atual válida com base em um cache anterior. Ao entrar na página ou atualizar a lista, sincronizar os IDs de forma coordenada ou adotar um estado comum que incorpore os produtos recebidos. Preservar a remoção imediata e impedir que respostas anteriores a uma mutação restaurem um item já removido.

Não basta retirar o filtro e deixar os corações desatualizados: listagem e estado dos botões precisam concordar.

**Critérios de conclusão:**

- [ ] Produto restaurado aparece ao voltar à página, sem exigir recarregamento completo.
- [ ] Favorito adicionado em outra sessão aparece na próxima consulta explícita da lista.
- [ ] Todos os cards da resposta válida aparecem com coração marcado.
- [ ] Contador, paginação e mensagem de lista vazia correspondem aos dados exibidos.
- [ ] Resposta antiga não reapresenta produto removido durante uma consulta.
- [ ] Há teste de regressão com IDs antigos e uma resposta paginada mais recente.

## 3. Testes que ainda precisam ser implementados

As proteções de sessão existem no código, mas os testes atuais do contexto cobrem apenas carregamento inicial, clique duplicado e falha/repetição da remoção. A última tentativa de ampliar esses testes por subagente foi interrompida por limite de uso; os cenários abaixo não foram entregues.

### Prioridade alta — sessão e respostas assíncronas

- [ ] Iniciar uma inclusão, fazer logout e entrar com outro usuário; resolver a inclusão antiga e comprovar que ela não altera IDs ou operações pendentes da nova conta.
- [ ] Resolver uma consulta de IDs da conta anterior depois da troca e comprovar seu descarte.
- [ ] Expirar um JWT com temporizadores controlados e verificar limpeza da conta, dos favoritos e da rota privada sem depender de navegação manual.
- [ ] Retornar `401` na consulta, inclusão, remoção e página; verificar o encerramento da sessão.
- [ ] Manter o pedido de logout pendente e verificar que o estado local já foi limpo e que a chamada preservou a autorização da sessão encerrada.
- [ ] Cobrir a alteração do interceptor Axios: um cabeçalho `Authorization` explícito deve ser preservado.

Esses itens são lacunas de cobertura, não afirmações de que já exista vazamento de dados entre contas.

### Prioridade média — recuperação e integração dos componentes

- [ ] Falha na consulta inicial de IDs bloqueia alterações até uma nova tentativa bem-sucedida, sem apresentar um estado desconhecido como confirmação de “não favoritado”.
- [ ] Adicionar e remover usando o card real dentro do provider real; comprovar atualização de outro card do mesmo produto.
- [ ] Remover o último produto da última página com a API retornando `404` para a página que deixou de existir; comprovar retorno à página anterior.
- [ ] Verificar acessibilidade por teclado e alteração de `aria-pressed`, inclusive com erro de gravação.
- [ ] Testar o retorno após login com filtros de catálogo na query string.

O teste atual da página usa um contexto simulado com `revision: 0` e um botão substituindo o card. Ele cobre página vazia durante paginação, mas não demonstra a remoção completa pelo card, alteração de revisão, nova consulta e correção da página.

### Backend — complemento de cobertura

- [ ] Exercitar duas inclusões simultâneas do mesmo par no PostgreSQL, verificando um único vínculo e respostas sem erro interno. A constraint e a inclusão repetida já são testadas; concorrência real não foi demonstrada.
- [ ] Testar listagem e IDs de um favorito já salvo cujo drop se tornou privado. Há teste de produto inativo e rejeição de inclusão em drop privado, mas não o ciclo completo desse caso.
- [ ] Fortalecer o teste OpenAPI para conferir os campos do envelope paginado e `product_ids`. O teste atual valida o schema e a presença de `content`, sem afirmar a estrutura completa de cada resposta.

## 4. Pendências de qualidade e evidências

### Lint do frontend

O lint completo passou de **77 erros e 3 avisos** no registro inicial para **81 erros e 3 avisos** na validação atual. Portanto, não é correto atribuir todos os apontamentos atuais apenas a problemas anteriores.

- Os dois testes novos de `ShioDesign.test.jsx` acrescentam quatro usos de `it`/`expect` sem imports reconhecidos pelo ESLint. O arquivo já tinha outros apontamentos da mesma classe. Importar explicitamente os símbolos de Vitest ou configurar corretamente os globais dos testes resolve a causa.
- A nova declaração lazy da página em `routes/index.jsx` acrescenta um apontamento `react-refresh/only-export-components` ao padrão já existente no arquivo. Ajustar a regra para esse módulo de configuração de rotas ou adotar uma organização compatível, de forma explícita e justificada.
- Um apontamento anterior de `AuthContext` foi eliminado; isso explica a diferença líquida de quatro erros, apesar dos cinco novos apontamentos acima.

**Conclusão:** tratar os apontamentos da alteração e registrar separadamente a dívida de lint anterior.

### Integração real e entrega

- [ ] Executar o fluxo navegador → API Django real → banco: incluir, recarregar, remover, sair e entrar novamente.
- [ ] Validar a migration no ambiente de homologação e planejar sua aplicação antes de disponibilizar o frontend atualizado.
- [ ] Registrar evidências reproduzíveis no repositório. Scripts e imagens temporários em `/tmp` não são evidências permanentes da entrega.
- [ ] Após correção e testes, revisar os diffs e preparar os commits/PRs conforme o fluxo do projeto. Nenhum commit, publicação ou implantação desta feature foi realizado nesta sessão.

Os testes de API executam o Django com SQLite de teste. A inspeção de interface usa API simulada. Esses dois resultados são úteis, mas não substituem a validação integrada com PostgreSQL e configuração de aplicação.

## 5. Resultados verificados

| Verificação | Resultado | Limite da evidência |
| --- | --- | --- |
| `pytest products/test_wishlist.py -q` | **13 passaram** | SQLite; não exercita concorrência real no PostgreSQL |
| Django `check --settings=core.settings.test` | **Sem problemas** | Configuração de testes |
| `makemigrations --check --dry-run --settings=core.settings.test` | **Nenhuma alteração pendente de geração** | Não confirma aplicação da migration em produção |
| Ruff check e format nos seis arquivos de backend da feature | **Passaram** | Não inclui alterações locais anteriores em `orders/views.py` |
| `npm run build` | **Passou** | Compilação não demonstra comportamento de sessão |
| Testes focados do frontend: contexto, página e card | **9 passaram**, 3 arquivos | Não incluem os cenários de sessão listados como pendentes |
| Suíte completa do frontend | **94 passaram, 2 falharam**, 30 arquivos | Falhas em CartPage e PaymentPage; investigação de referência abaixo |
| Lint completo do frontend | **81 erros, 3 avisos** | Inclui dívida anterior e apontamentos acrescentados |
| Suíte completa do backend, execução de integração desta sessão | **384 passaram, 8 falharam, 1 ignorado** | Comparada à versão anterior nas mesmas condições de teste |
| Interface desktop/mobile | Fluxo básico aprovado | API simulada; sem overflow horizontal a 390 px |
| Reprodução com IDs antigos | **Defeito confirmado** | `count=1`, zero cards, mensagem de lista vazia |

### Falhas do backend já reproduzidas antes da feature

A cópia limpa do backend no commit `10ba2a6` apresentou **371 testes aprovados, as mesmas oito falhas e um ignorado**. A execução com favoritos acrescentou os 13 testes aprovados. Os nomes coincidem:

1. `CheckoutDropLimitTests::test_cancelar_pedido_existente_libera_quantidade_para_novo_checkout`.
2. `CheckoutDropLimitTests::test_checkout_bloqueado_quando_excede_max_quantity_do_drop`.
3. `InfinitePayCardSimulationTests::test_cartao_de_teste_aprovado_confirma_pagamento`.
4. `InfinitePayCardSimulationTests::test_cartao_de_teste_recusado_mantem_pedido_pendente`.
5. `ProductVisibilityViaDropTests::test_listagem_publica_oculta_produto_de_drop_oculto`.
6. `ProductVisibilityViaDropTests::test_produto_de_drop_rascunho_e_visivel_mas_nao_vendavel`.
7. `ConcurrentCheckoutStockTests::test_checkout_concorrente_nao_ultrapassa_estoque`.
8. `ConcurrentCheckoutDropLimitTests::test_checkout_concorrente_nao_ultrapassa_max_quantity`.

Essa comparação permite classificar essas oito falhas como reproduzíveis antes de favoritos **no ambiente usado**. Não estabelece uma causa única para elas nem equivale a uma suíte geral aprovada.

### Comparação das falhas do frontend

Na cópia limpa do commit `2b430d2`, a execução isolada dos arquivos de CartPage e PaymentPage apresentou 23 testes aprovados e uma falha: `CartPage > should not show a dead promo code field`. Essa falha é, portanto, reproduzível antes da implementação.

O teste `PaymentPage > exibe valores do servidor e não aplica desconto PIX local` falhou por espera excedida na suíte completa atual, mas passou nas execuções isoladas tanto da versão anterior quanto do código atual. Os dois arquivos, executados juntos e isolados do restante da suíte, produziram o mesmo resultado nas duas versões: 23 aprovados e somente a falha de CartPage. Não foi demonstrada uma regressão de favoritos nesse teste de pagamento; permanece uma instabilidade a investigar sob a carga da suíte completa.

## 6. Comandos e ambiente para retomar

O Python padrão do sistema é 3.10 e não atende ao uso atual de `datetime.UTC`. A validação do backend utilizou Python 3.12 em `/tmp/shio-wishlist-venv`, com as dependências de `backend/requirements.txt` instaladas. Esse ambiente é temporário.

```bash
# Executar a partir de backend/
DJANGO_SECRET_KEY=wishlist-local-test GOOGLE_CLIENT_ID=wishlist-test \
  SETTINGS_FILE_PATH=core.settings.test \
  /tmp/shio-wishlist-venv/bin/python -m pytest products/test_wishlist.py -q

# Executar a partir de frontend/
npm test -- --run
npm test -- --run src/context/WishlistContext.test.jsx \
  src/pages/user/MyFavoritesPage/index.test.jsx \
  src/components/ui/ShioDesign.test.jsx
npm run build
npm run lint
```

Os logs desta validação estão temporariamente em `/tmp/wishlist-validation-frontend-tests.log`, `/tmp/wishlist-validation-focused.log`, `/tmp/wishlist-validation-build.log`, `/tmp/wishlist-validation-lint.log` e `/tmp/wishlist-validation-backend-tests.log`. A comparação do backend está em `/tmp/wishlist-backend-baseline.log` e `/tmp/wishlist-backend-final.log`; a comparação isolada de CartPage/PaymentPage, em `/tmp/wishlist-validation-frontend-baseline.log` e `/tmp/wishlist-validation-current-checkout.log`. A reprodução visual está em `/tmp/wishlist-stale-ids-check.cjs` e `/tmp/wishlist-stale-ids.png`.

## 7. Ordem recomendada de conclusão

1. Corrigir a reconciliação da listagem e dos IDs, junto com o teste que reproduz o defeito.
2. Entregar os testes críticos de sessão e recuperação de falhas.
3. Resolver os apontamentos de lint acrescentados e repetir as verificações afetadas.
4. Validar o fluxo com API real e PostgreSQL, incluindo migration e concorrência.
5. Consolidar evidências e preparar a entrega dos três repositórios.

Listas compartilhadas, favoritos anônimos, notificações e alertas de estoque continuam fora do escopo da issue. A ausência dessas funcionalidades não é uma pendência desta implementação.
