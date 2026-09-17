# Backlog do Projeto

## Visão Geral

Este documento consolida os itens presentes no quadro Kanban do projeto **Shio**, registrando cada atividade.

---

## O1 — Tornar o backend a fonte única do valor da compra

**Issue:** [#22 — O1: [Bug] Tornar o backend a fonte única do valor da compra](https://github.com/Shio-Enterprise/Documentacao/issues/22)  
**Responsáveis:** [Cauã Araujo](https://github.com/caua08), [Felipe Motta](https://github.com/M0tt1nh4), [Amanda Cruz](https://github.com/mandicrz) 
**Sprint:** Sprint 1
**Tipo:** Bug
**Prioridade:** Alta
**Escopo:** Frontend e Backend
**Estimativa:** 3
**Status no quadro:** Done

### Descrição

O checkout aceitava valores financeiros enviados pelo cliente, utilizava `float` em cálculos monetários e registrava pagamentos com informações que poderiam divergir do estado real do gateway.

A atividade estabelece o backend como fonte única de verdade para subtotal, frete, descontos e total da compra. A cotação de frete deve possuir validade e vínculo com usuário, carrinho e endereço, enquanto a confirmação de pagamento deve depender do estado verificado junto ao provedor.

### Critérios de Aceitação

- Rejeitar valores financeiros enviados pelo cliente e garantir consistência entre os valores apresentados no frontend, registrados no pedido e enviados ao gateway.
- Rejeitar cotações expiradas, pertencentes a outro usuário ou incompatíveis com a compra.
- Garantir que pagamentos pendentes, redirecionamentos e falhas de consulta nunca sejam apresentados como pagamentos confirmados.
- Impedir duplicações em reenvios do checkout e notificações, utilizando idempotência.
- Garantir que somente uma confirmação verificada no gateway altere o estado do pagamento.
- Garantir que notificações repetidas não repitam efeitos nem façam estados retrocederem.
- Validar que subtotal, frete, desconto e total sejam consistentes entre frontend, cotação, pedido e gateway.

---

## O2 — Reserva de estoque e proteção concorrente

**Issue:** [#26 — O2: [Bug] Implementar reserva de estoque e proteção concorrente](https://github.com/Shio-Enterprise/Documentacao/issues/26)  
**Responsáveis:** [João Gabriel](https://github.com/JoaoComTil), [João Ramos](https://github.com/Joaolramos)
**Sprint:** Sprint 1  
**Prioridade:** Alta  
**Estimativa:** 1  
**Status no quadro:** In progress

### Descrição

A atividade define e implementa uma estratégia de reserva de estoque que impeça vendas concorrentes da mesma unidade e mantenha o saldo disponível consistente durante checkout, pagamento, cancelamento e expiração.

O fluxo deve tratar reservas temporárias, concorrência transacional, conversão da reserva em venda e liberação do estoque quando uma compra não for concluída.

### Critérios de Aceitação

#### Modelo de reserva

- Definir o modelo utilizado para representar a reserva, incluindo variação, quantidade, pedido, estado e expiração.
- Definir o estoque disponível como estoque físico menos reservas ativas.
- Definir um tempo de expiração para reservas criadas durante pedidos aguardando pagamento.

#### Concorrência e transação

- Utilizar bloqueio de registros com `select_for_update()` dentro de `transaction.atomic()`.
- Definir uma ordem consistente de bloqueio para múltiplas variações, evitando deadlocks.
- Considerar reservas ativas de outros pedidos ao validar disponibilidade.

#### Expiração

- Definir a estratégia de expiração e liberação das reservas.
- Definir o estado do pedido quando a reserva expirar.
- Impedir o pagamento normal de um pedido cuja reserva já expirou.

#### Conversão em venda

- Converter a reserva em baixa definitiva somente após confirmação válida do pagamento.
- Criar exatamente um `StockMovement(kind=SAIDA, reason=VENDA)` por item vendido.
- Tornar o processamento idempotente diante de reentregas ou retries do webhook.
- Liberar a reserva em pagamentos recusados, cancelamentos ou falhas sem gerar movimentação de venda.
- Garantir que ajustes administrativos não produzam estoque negativo ao ignorar reservas existentes.

#### Testes

- Simular dois checkouts concorrentes disputando a última unidade e garantir que apenas um seja aceito.
- Comprovar que reservas expiradas liberam o estoque.
- Garantir que um pagamento aprovado gere exatamente uma movimentação de venda por item.
- Comprovar que cancelamento ou falha de pagamento não deixa estoque indevidamente reservado.

---

## O3 — Disponibilidade e escassez dos drops

### O3.1 — Definir política e experiência de disponibilidade

**Issue:** [#6 — O3: Definir política e experiência de disponibilidade dos drops](https://github.com/Shio-Enterprise/Documentacao/issues/6)  
**Responsáveis:** [Matheus de Alcântara](https://github.com/matheusdealcantara), [Vilmar Fagundes](https://github.com/VilmarFagundes)
**Sprint:** Sprint 1  
**Tipo:** Refatoração e Documentação  
**Escopo:** Frontend e Backend  
**Estimativa:** 2  
**Status no quadro:** Done

### Descrição

O sistema possuía regras diferentes para determinar se um drop estava público, ativo, futuro, encerrado ou esgotado. A atividade estabelece uma política única de disponibilidade que possa ser aplicada de maneira consistente pelo backend e pelo frontend.

### Critérios de Aceitação

- Registrar uma tabela de decisão considerando `is_public`, `is_active`, `launch_date`, `end_date` e `max_quantity`.
- Separar conceitualmente visibilidade pública e elegibilidade para venda.
- Definir o comportamento de produtos sem drop e produtos associados a drops privados, futuros, encerrados ou esgotados.
- Definir como `max_quantity` contabiliza unidades.
- Definir duração, expiração e liberação caso reservas sejam adotadas.
- Definir acesso para visitantes, clientes e administradores.
- Definir respostas `404`, `400` ou `409` conforme ocultação ou indisponibilidade.
- Definir estados visuais únicos: Privado, Rascunho, Programado, Disponível, Encerrado e Esgotado.
- Definir mensagens e ações disponíveis para cada estado.
- Definir o comportamento da interface caso a disponibilidade mude durante carrinho ou checkout.
- Publicar a tabela de decisão e referenciá-la na implementação técnica.

### O3.2 — Aplicar disponibilidade e escassez

**Issue:** [#7 — O3: [Feature] Aplicar disponibilidade e escassez dos drops](https://github.com/Shio-Enterprise/Documentacao/issues/7)  
**Responsáveis:** [Matheus de Alcântara](https://github.com/matheusdealcantara), [Vilmar Fagundes](https://github.com/VilmarFagundes)
**Sprint:** Sprint 1  
**Tipo:** Refatoração  
**Escopo:** Frontend e Backend  
**Estimativa:** 2  
**Status no quadro:** Done

### Descrição

Implementa no sistema a política definida na issue #6, centralizando a avaliação de visibilidade e venda dos drops e aplicando essas regras no catálogo, carrinho, checkout e painel administrativo.

### Critérios de Aceitação

- Criar uma única regra reutilizável para avaliar visibilidade e elegibilidade de venda.
- Aplicar automaticamente a visibilidade pública na listagem de drops.
- Retornar `404` ao público para drops não visíveis.
- Ocultar produtos inativos ou relacionados a drops não visíveis.
- Revalidar disponibilidade e estoque ao alterar o carrinho e antes da criação do pedido.
- Bloquear atomicamente estoque e limite do drop durante o checkout.
- Impedir que requisições concorrentes ultrapassem `max_quantity`.
- Validar `max_quantity` como inteiro positivo ou `null`.
- Validar corretamente `launch_date` e `end_date`.
- Disponibilizar no frontend os controles administrativos necessários.
- Unificar os estados apresentados nas telas de drops.
- Tratar indisponibilidade durante o checkout sem permitir finalização indevida.
- Cobrir cenários de drop privado, futuro, encerrado, esgotado e acesso administrativo.
- Executar teste concorrente para estoque e limite do drop.

---

## O4 — Autenticação, autorização administrativa e JWT

### O4.1 — Decisão arquitetural

**Issue:** [#2 — O4: Corrigir autenticação, autorização admin e ciclo JWT - Decisão Arquitetural](https://github.com/Shio-Enterprise/Documentacao/issues/2)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)
**Sprint:** Sprint 1  
**Tipo:** Refatoração  
**Prioridade:** Alta  
**Escopo:** Backend  
**Estimativa:** 1  
**Status no quadro:** Done

### Descrição

A atividade investiga inconsistências entre autenticação, identificação de administradores, proteção das rotas e ciclo de vida dos tokens JWT, além de definir formalmente a estratégia de autenticação que deve ser utilizada pelo sistema.

### Critérios de Aceitação

- Analisar o fluxo atual de autenticação, serialização do usuário e proteção das rotas administrativas.
- Avaliar impacto técnico e de UX entre autenticação Google-only e login por senha.
- Realizar alinhamento técnico para escolha da abordagem.
- Documentar formalmente a decisão arquitetural adotada.

### O4.2 — Implementar autorização administrativa e ciclo JWT

**Issue:** [#3 — O4: [Bug] Corrigir autorização de admin, ciclo JWT e rotas privadas](https://github.com/Shio-Enterprise/Documentacao/issues/3)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 1  
**Tipo:** Bug  
**Prioridade:** Alta  
**Escopo:** Backend  
**Estimativa:** 3  
**Status no quadro:** Done

### Descrição

A atividade corrige falhas de controle de acesso que permitiam a usuários comuns acessar visualmente áreas administrativas, além de alinhar o contrato de identificação do administrador e o ciclo de refresh/logout dos tokens JWT.

### Critérios de Aceitação

- Expor corretamente no backend o indicador de permissão administrativa.
- Criar uma proteção específica de rotas administrativas no frontend.
- Impedir que usuários comuns visualizem o painel administrativo.
- Implementar um fluxo centralizado de renovação de token.
- Garantir rotação adequada do JWT.
- Fazer o logout invalidar a sessão/token também no servidor.

---

## O5 — Catálogo, busca e paginação server-side

**Issue:** [#25 — O5: [Feature] Tornar catálogo, busca e paginação server-side](https://github.com/Shio-Enterprise/Documentacao/issues/25)  
**Responsáveis:** [Cauã Araujo](https://github.com/caua08), [Felipe Motta](https://github.com/M0tt1nh4), [Amanda Cruz](https://github.com/mandicrz)  
**Sprint:** Sprint 1  
**Tipo:** Refatoração  
**Prioridade:** Média  
**Escopo:** Frontend e Backend  
**Estimativa:** 1  
**Status no quadro:** Done

### Descrição

Busca, filtros, categorias, ordenação e paginação eram processados parcialmente no frontend sobre apenas uma página de resultados. Isso fazia produtos existentes em páginas posteriores desaparecerem de buscas e filtros.

A atividade move essas operações para o backend e torna as listagens dependentes dos dados reais do catálogo.

### Critérios de Aceitação

- Paginar o catálogo pelo backend e permitir acesso a todos os produtos.
- Fazer rotas de categoria exibirem somente os produtos da categoria correspondente.
- Executar busca, filtros e ordenação no backend.
- Considerar produtos de todas as páginas nos resultados.
- Calcular “Mais vendidos” utilizando itens de pedidos válidos.
- Exibir apenas produtos disponíveis em listagens e recomendações.
- Validar navegação em catálogos com mais de 20 produtos.
- Garantir que pedidos cancelados ou inválidos não afetem o ranking de mais vendidos.

---

## O6 — Ciclo operacional dos pedidos

**Issue:** [#23 — O6: [Feat] Completar e restringir o ciclo operacional dos pedidos](https://github.com/Shio-Enterprise/Documentacao/issues/23)  
**Responsáveis:** [Cauã Araujo](https://github.com/caua08), [Felipe Motta](https://github.com/M0tt1nh4), [Amanda Cruz](https://github.com/mandicrz)  
**Sprint:** Sprint 1  
**Tipo:** User Story  
**Prioridade:** Média  
**Escopo:** Frontend  
**Estimativa:** 1  
**Status no quadro:** Done

### Descrição

O sistema permitia mudanças arbitrárias de estado do pedido, incluindo despacho ou entrega sem confirmação de pagamento. A atividade introduz uma máquina de estados única e garante que backend, painel administrativo, cancelamentos e integrações respeitem as mesmas transições.

### Critérios de Aceitação

- Rejeitar com `400` qualquer transição não prevista na máquina de estados.
- Impedir despacho ou entrega de pedidos sem pagamento confirmado.
- Criar exatamente um registro de histórico para cada alteração de estado.
- Permitir ao administrador executar pela interface todo o ciclo operacional válido.
- Exibir ao cliente uma linha do tempo consistente com o histórico e rastreamento.
- Cobrir em testes todas as transições permitidas e transições inválidas relevantes.
- Testar o ciclo administrativo completo até a entrega.
- Confirmar a ordenação correta dos estados na linha do tempo do cliente.

---

## O7 — Métricas comerciais, CRM e dashboard

### O7.1 — Definir regras das métricas comerciais

**Issue:** [#10 — O7: Definir regras e apresentação das métricas comerciais](https://github.com/Shio-Enterprise/Documentacao/issues/10)  
**Responsáveis:** [Matheus de Alcântara](https://github.com/matheusdealcantara), [Vilmar Fagundes](https://github.com/VilmarFagundes)  
**Sprint:** Sprint 1  
**Tipo:** Bug  
**Escopo:** Frontend, Backend e Banco de Dados  
**Status no quadro:** Done

### Descrição

A atividade define as regras comerciais que devem ser utilizadas de forma consistente pelo dashboard, CRM e métricas dos drops.

### Critérios e Regras Definidas

#### Receita

- Uma venda positiva exige simultaneamente pagamento `PAID` e pedido `DELIVERED`.
- A competência temporal utiliza `Payment.paid_at`.
- A receita utiliza `CustomerOrder.total_amount`.
- Frete compõe a receita e desconto reduz seu valor.
- Reembolso integral gera ajuste negativo.
- Ticket médio é calculado pela receita líquida dividida pela quantidade de vendas válidas.
- Receita por drop utiliza `OrderItem.quantity × OrderItem.unit_price`.
- Frete e desconto não são rateados entre drops.

#### CRM

- Quantidade de pedidos, gasto acumulado e última compra utilizam somente vendas válidas.
- Reembolsos reduzem as métricas financeiras.
- “Cliente ativo” não é utilizado como métrica.
- O dashboard deve apresentar **Clientes cadastrados**.
- Cliente recorrente possui compras válidas em pelo menos dois drops consecutivos.
- O histórico deve manter pedidos que geram e que não geram receita, devidamente classificados.
- A pesquisa do CRM deve utilizar nome ou e-mail.

#### Períodos e apresentação

- O dashboard utiliza apenas os períodos Mensal e Anual.
- Mensal considera 30 dias e agrupamento diário.
- Anual utiliza agrupamento mensal.
- As fronteiras temporais utilizam `America/Sao_Paulo`.
- Um único campo permite pesquisa por cliente, e-mail, produto, drop ou categoria.
- Não há filtro de status no dashboard.
- Cards, gráfico, pedidos recentes e drill-down devem usar a mesma consulta.
- Drill-down deve ser paginado e ordenado por `paid_at` decrescente.

### O7.2 — Consolidar métricas do CRM e dashboard

**Issue:** [#11 — O7: [Bug] Consolidar métricas do CRM e dashboard](https://github.com/Shio-Enterprise/Documentacao/issues/11)  
**Responsáveis:** [Matheus de Alcântara](https://github.com/matheusdealcantara), [Vilmar Fagundes](https://github.com/VilmarFagundes) 
**Sprint:** Sprint 1  
**Status no quadro:** Done

### Descrição

Implementa as decisões da issue #10 e centraliza as métricas no backend, eliminando cálculos inconsistentes executados sobre páginas parciais de dados no frontend.

### Critérios de Aceitação

- Dashboard e CRM devem utilizar as mesmas regras comerciais.
- Receita, quantidade de vendas, gráfico, pedidos recentes e drill-down devem ser conciliáveis.
- A competência temporal deve utilizar `paid_at` e timezone `America/Sao_Paulo`.
- O gráfico não pode depender da primeira página da listagem administrativa.
- A interface não deve apresentar período de 90 dias, filtro de status, exportação ou card de clientes ativos.
- O CRM deve pesquisar apenas por nome ou e-mail.
- Métricas do CRM devem ser calculadas no backend.
- Receita por drop não deve inferir rateio de frete ou desconto.
- Estados de carregamento, vazio e erro devem ser tratados no frontend.
- As fórmulas e contratos devem ser documentados no OpenAPI.

---

## O8 — Produtos, promoções e ledger de estoque

### O8.1 — Definir modelo de custo, promoção e variações

**Issue:** [#17 — O8: Definir modelo de custo, promoção e variações de produto](https://github.com/Shio-Enterprise/Documentacao/issues/17)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 1  
**Tipo:** Refatoração e Documentação  
**Escopo:** Backend  
**Estimativa:** 1  
**Status no quadro:** Done

### Descrição

A atividade define o modelo funcional para custo, margem, preço promocional, variações, duplicação de produtos e movimentações de estoque.

### Critérios de Aceitação

- Definir `cost_price`, obrigatoriedade e local de cálculo/exibição da margem.
- Definir contrato do preço promocional e período de validade.
- Definir precedência do preço promocional sobre o preço base.
- Definir política de variações e unicidade de tamanho/cor.
- Definir tratamento de SKU informado manualmente.
- Definir comportamento da variação “Único”.
- Definir quais dados são copiados na duplicação e como evitar colisões.
- Definir ledger de estoque com `balance_after` imutável e referência à origem.
- Definir se peso e dimensões pertencem ao escopo desta atividade ou ao fluxo de frete.
- Publicar e referenciar a decisão na implementação técnica.

### O8.2 — Completar domínio de produtos e ledger de estoque

**Issue:** [#16 — O8: [Feature] Completar domínio de produtos e ledger de estoque](https://github.com/Shio-Enterprise/Documentacao/issues/16)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 1  
**Tipo:** User Story  
**Escopo:** Frontend, Backend e Banco de Dados  
**Estimativa:** 1  
**Status no quadro:** Done

### Descrição

Implementa o modelo definido para custos, promoções, variações e histórico de estoque, corrigindo também inconsistências de duplicação de produtos e saldo histórico.

### Critérios de Aceitação

#### Backend

- Adicionar `cost_price` e expô-lo nos serializers.
- Implementar preço promocional com validade.
- Tornar o ledger de estoque imutável com `balance_after`.
- Registrar movimentação para estoque inicial.
- Criar produto e variações de maneira transacional.
- Corrigir duplicação preservando atributos e evitando colisões de SKU.
- Garantir combinação única de tamanho/cor.
- Documentar contratos no OpenAPI.

#### Frontend

- Permitir informar custo e visualizar margem.
- Enviar corretamente os dados de preço promocional.
- Corrigir o fluxo de duplicação para preservar atributos e permitir novo SKU.

#### Testes

- Cobrir persistência e expiração de promoções.
- Validar reconstrução do saldo pelo ledger.
- Cobrir duplicação sem colisão de SKU.
- Rejeitar combinações duplicadas de tamanho/cor.

---

## O9 — Promessas comerciais sem suporte no backend

### O9.1 — Definir tratamento das promessas comerciais

**Issue:** [#19 — O9: Definir tratamento das promessas comerciais sem suporte no backend](https://github.com/Shio-Enterprise/Documentacao/issues/19)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 1  
**Tipo:** Documentação  
**Escopo:** Frontend  
**Estimativa:** 1  
**Status no quadro:** Done

### Descrição

A interface apresentava promessas que não possuíam suporte real no backend, como desconto de primeira compra, newsletter, e-mail de confirmação, avaliações e links jurídicos.

A atividade define, para cada promessa, se ela deve ser removida ou implementada efetivamente.

### Critérios de Aceitação

- Decidir entre remover ou implementar cada promessa comercial existente.
- Definir o tratamento do cupom de primeira compra.
- Definir requisito mínimo de consentimento para newsletter em conformidade com a LGPD.
- Definir tratamento dos links de termos de uso e política de privacidade.
- Garantir que badges de pagamento reflitam apenas os métodos suportados pelo gateway.
- Publicar as decisões e referenciá-las na implementação técnica.

### O9.2 — Remover ou implementar promessas conforme decisão

**Issue:** [#18 — O9: [Bug] Remover ou implementar promessas comerciais conforme decisão](https://github.com/Shio-Enterprise/Documentacao/issues/18)  
**Responsáveis:** [Danilo Naves](https://github.com/DaniloNavesS), [Ian Costa](https://github.com/iancostag), [Arthur Sousa](https://github.com/Tutzs)  
**Sprint:** Sprint 1  
**Tipo:** Bug  
**Escopo:** Frontend  
**Estimativa:** 1  
**Status no quadro:** Done

### Descrição

Executa as decisões da issue #19, removendo promessas sem suporte e implementando funcionalidades comerciais que permaneceram no escopo.

### Critérios de Aceitação

#### Remoções

- Remover a promessa incorreta de 20% e substituir pela oferta real.
- Remover promessa de e-mail transacional que não existe nesta entrega.
- Remover links jurídicos enquanto o conteúdo correspondente não existir.
- Remover ou substituir avaliações fixas sem suporte real.

#### Implementações

- Implementar cupom server-side de 10% na primeira compra.
- Impedir reutilização indevida do cupom e respeitar sua validade.
- Persistir consentimento de newsletter no backend com aceite explícito.
- Exibir apenas métodos de pagamento efetivamente aceitos pela InfinitePay.

#### Testes

- Nenhuma tela deve apresentar confirmação de evento que não ocorreu no backend.
- O cupom não pode ser reutilizado indevidamente.
- Links jurídicos não devem aparecer enquanto não houver conteúdo correspondente.

---

## O10 — Segurança, integrações e observabilidade

### O10.1 — Definir segurança e experiência das integrações externas

**Issue:** [#14 — O10: Definir segurança e experiência das integrações externas](https://github.com/Shio-Enterprise/Documentacao/issues/14)  
**Responsáveis:** [Matheus de Alcântara](https://github.com/matheusdealcantara), [Vilmar Fagundes](https://github.com/VilmarFagundes)  
**Sprint:** Sprint 2  
**Status no quadro:** Todo

### Descrição

A atividade define as decisões de segurança e operação necessárias para integrações externas, especialmente Correios, checkout, cache, banco de dados e observabilidade.

Seu resultado serve como pré-requisito para a implementação técnica da issue #15.

### Critérios de Aceitação

#### Acesso e limites

- Proteger o inventário com acesso administrativo.
- Documentar comportamentos `401` e `403`.
- Definir se CEP e agências permanecem públicos.
- Definir identificação por usuário, IP ou ambos.
- Estabelecer taxas objetivas de throttling e resposta `429`.

#### Contrato logístico

- Definir a origem do peso usado no frete.
- Definir CEP de origem e serviços permitidos como dados controlados pelo servidor.
- Escolher entre cotação persistida ou recálculo obrigatório no checkout.
- Definir validade da cotação.
- Determinar quais alterações de carrinho/endereço invalidam a cotação.

#### Ambientes e operação

- Separar URLs e credenciais entre mock, homologação e produção.
- Definir cache compartilhado para tokens e respostas.
- Exigir TLS para PostgreSQL em produção.
- Definir bootstrap explícito do primeiro administrador.
- Definir campos mínimos de logs estruturados.
- Definir mascaramento de dados pessoais, credenciais e payloads.
- Definir métricas, limites e canais de alerta.

#### Experiência de frontend

- Definir mensagens para `400`, `429` e `503`.
- Bloquear checkout sem cotação válida.
- Invalidar cotação ao trocar endereço ou modificar carrinho.
- Evitar cotações simultâneas e retries inadequados.

---

### O10.2 — Endurecer integrações, checkout e observabilidade

**Issue:** [#15 — O10: [Security] Endurecer integrações, checkout e observabilidade](https://github.com/Shio-Enterprise/Documentacao/issues/15)  
**Responsáveis:** [Matheus de Alcântara](https://github.com/matheusdealcantara), [Vilmar Fagundes](https://github.com/VilmarFagundes)  
**Sprint:** Sprint 2  
**Status no quadro:** Todo

### Descrição

Implementa as decisões definidas na issue #14. O objetivo é proteger os endpoints administrativos, tornar configurações de integração centralizadas, impedir manipulação do frete e melhorar segurança operacional, logs, cache e observabilidade.

### Critérios de Aceitação

#### Acesso e integração

- Proteger `/api/catalog/inventory/` com permissão administrativa.
- Retornar `401` para usuário anônimo, `403` para cliente e `200` para administrador.
- Construir endpoints dos Correios a partir de `CORREIOS_API_BASE_URL`.
- Preservar o modo mock.
- Remover do cliente o controle de `cep_origem`, `peso` e `codigo_servico`.
- Utilizar somente dados logísticos definidos pelo servidor.

#### Cotação e checkout

- Implementar cotação autoritativa vinculada a usuário, carrinho e endereço.
- Invalidar ou recalcular cotação quando compra, endereço ou validade mudar.
- Ignorar/rejeitar `shipping_cost` enviado pelo cliente.
- Impedir que falha ou ausência de cotação resulte em frete zero.

#### Segurança e operação

- Implementar throttling conforme regras definidas.
- Configurar cache compartilhado entre instâncias.
- Centralizar timeouts e limitar retries.
- Manter retorno `503` em indisponibilidade externa.
- Exigir TLS para PostgreSQL em produção.
- Remover criação automática e incondicional do administrador no entrypoint.
- Implementar logs estruturados e `correlation_id`.
- Sanitizar e mascarar dados sensíveis nos logs.
- Expor métricas e configurar alertas.

#### Frontend

- Enviar somente os dados mínimos necessários para cotação.
- Não enviar `shipping_cost` como fonte de verdade no checkout.
- Bloquear avanço com cotação ausente, expirada, carregando ou com falha.
- Refazer cotação após mudança de endereço ou carrinho.
- Tratar `429` com espera antes de nova tentativa.
- Tratar `503` como indisponibilidade temporária sem retry ilimitado.

#### Testes

- Cobrir autorização do inventário e configuração dos hosts externos.
- Comprovar que adulterar o frete não altera o total.
- Cobrir expiração da cotação.
- Cobrir throttling, cache compartilhado, TLS e sanitização de logs.
- Cobrir no frontend alteração de carrinho/endereço, bloqueio de checkout, `429` e `503`.

---

## Atividade Complementar — Acesso ao painel administrativo

**Issue:** [#20 — Corrigir acesso ao painel administrativo](https://github.com/Shio-Enterprise/Documentacao/issues/20)  
**Responsável:** [Matheus de Alcântara](https://github.com/matheusdealcantara)
**Prioridade:** Média  
**Status no quadro:** Done

### Descrição

O frontend identificava administradores de maneira incompleta e não diferenciava corretamente sessão expirada de falta de permissão ao redirecionar o usuário para o login administrativo.

### Critérios de Aceitação

- Reconhecer como administrativa uma conta marcada como `is_admin`, `is_staff` ou `is_superuser`.
- Negar acesso a contas sem qualquer indicador administrativo.
- Restaurar corretamente a permissão administrativa a partir da sessão local.
- Em resposta `401`, limpar a sessão e informar que ela expirou.
- Em resposta `403`, limpar a sessão e informar falta de permissão.
- Exibir corretamente mensagens de autenticação e redirecionamento.
- Garantir que o build de produção do frontend seja concluído sem erros.
