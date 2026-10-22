# O10: auditoria do código remoto e sobreposição com a Sprint 3

**Atualizado:** 21/10/2026

**Base remota:** `backend/dev` (`e0541f8`), `frontend/dev` (`ae769fd`) e `Documentacao/main` (`da53105`)

**Estado de trabalho (22/10/2026):** etapa 1 organizada em commits locais; publicação e PRs pendentes.
**Objetivo:** identificar o que a O10 já entrega, o que falta e onde a implementação divide arquivos ou dependências com as tarefas informadas para a Sprint 3.

> Esta página é uma análise técnica do código e do backlog fornecido na conversa. Ela não registra tarefas novas no quadro. A consulta de 21/10/2026 identificou as issues #62, #66 e #67 na documentação da Sprint 3. Exportação está integrada; reposição e cupom por e-mail têm PRs de código abertos. A documentação foi sincronizada com o remoto preservando os arquivos locais da O10.

## Revisão do escopo original

A evidência da O10 na Sprint 2 define segurança das integrações externas e checkout: inventário administrativo, frete com parâmetros confiáveis do servidor, URLs configuráveis dos Correios, controle de taxa/cache/TLS, bootstrap administrativo, logs protegidos, observabilidade e respostas de erro no frontend. A referência original está em [`sprint_2/squad_1/o10-evidencias.md`](../../sprint_2/squad_1/o10-evidencias.md); as issues vinculadas são #14 e #15.

## Base remota e implementação local

| Área | Já existe | Falta ou precisa ser validado para O10 |
| --- | --- | --- |
| Acesso ao inventário | `products.views.inventory_summary` mantém DRF e `CanManageCatalog`; `products.services.get_inventory_summary()` agrega todas as variações com `annotate(Sum(...))` em uma consulta. | Agregação e permissões validadas pela suíte do backend. Preservar `CanManageCatalog`; não trocar pela permissão mais ampla `IsStaffOrSuperUser`. |
| Cotação no checkout | `ShippingQuote` persistida, expiração, cálculo no servidor e idempotência já existiam. Agora `ShippingParameters` imutável resolve origem, destino, serviço, peso, dimensões, valor declarado e versão da política; o snapshot persiste esse conjunto. | Peso/dimensões vêm da configuração do servidor como valores padrão por pacote; ainda não há peso ou dimensões por variação de produto. |
| Rota avulsa dos Correios | `ShippingOptionsView` exige autenticação, rejeita `cep_origem`, `peso` e `codigo_servico` enviados pelo cliente e usa os parâmetros resolvidos no servidor. | Nenhuma pendência funcional da Sprint 1 identificada nesta rota. |
| URLs dos Correios | `CorreiosClient` centraliza construção da URL, cabeçalhos de autenticação e transporte; todos os endpoints usam `CORREIOS_API_BASE_URL`. O modo mock continua disponível. | O teste de integração real com ambiente dos Correios continua dependente de credenciais e ambiente externo. |
| Token e concorrência | `CorreiosTokenProvider` usa `RedisCache` no alias `correios` e lock Redis entre processos; invalidação do token rejeitado preserva um token mais novo. Pools limitados, timeouts e erro controlado sem fallback em produção. | Validado em Redis descartável limitado a 25 MB; a instância Free do Render ainda precisa ser provisionada/conectada. Perda de dados ou reinício invalida a garantia do lock durante a interrupção. |
| Limites de chamadas | Há throttle DRF para criação de avaliações. | Não há limite específico de integração por usuário/IP nem reserva de quota global dos Correios. |
| PostgreSQL/TLS | A alteração local da configuração de produção exige TLS e rejeita configurações de downgrade. | Job de CI com PostgreSQL real e teste específico de preflight ficam para a Sprint 2. |
| Inicialização e admin bootstrap | `wait_for_database` consulta a conexão Django com timeout; o entrypoint deixa de criar superusuário automaticamente. O comando explícito `initadmin` já existe. | O comando ainda não valida estritamente e-mail/senha; manter execução só por operador. |
| Checkout e diagnóstico | `CheckoutAttempt` persiste `last_error_code` e `last_error_at` numa migration aditiva. O middleware injeta `X-Request-ID`; idempotência e estado `UNCERTAIN` continuam preservados. | Falta persistir `request_id`, produzir logs JSON mascarados, emitir métricas/alertas e reconciliar tentativas antigas. Validar formato/limite do `X-Request-ID` recebido. Não repetir pagamentos automaticamente. |
| Frontend de checkout | Mantém cotação, invalidação por mudanças no carrinho/endereço e bloqueia checkout por `Retry-After`; cálculo de frete também trata 429/503 e desabilita nova cotação até o prazo. | Integrar o branch de analytics com cuidado, pois ambos alteram `PaymentPage`. |
| CI e contrato | CI executa verificações, migrações e testes e agora sobe Redis para os testes de integração do token. | PostgreSQL/TLS real em CI, quotas e contratos completos seguem pendentes. A suíte PostgreSQL é validada localmente em ambiente isolado. |

### Testes já executados nesta revisão

- Frontend: **259 testes passaram em 50 arquivos**, incluindo 429/503 no cálculo e no checkout, espera sem polling automático e reutilização da tentativa. ESLint concluiu sem erros (18 warnings preexistentes); build de produção passou.
- Backend: **728 testes e 299 subtestes passaram com PostgreSQL 15 e Redis temporários**, sem testes ignorados. Ruff, formatação, Django system check, verificação de migrations e sintaxe do entrypoint passaram.
- Chrome: cotação, totais, confirmação, alteração de quantidade, 429/503, recuperação, tentativa `UNCERTAIN` sem duplicação e acesso administrativo foram validados com dados fictícios. A validação identificou e corrigiu a ausência de `CORS_EXPOSE_HEADERS` para `Retry-After` e `X-Request-ID`.
- [Registro da validação e limites](./o10-validacao-sprint-1.md).
- Redis para token e lock distribuído foi antecipado para a Sprint 1 por decisão de 21/10/2026. Quota, throttling de integração, logs JSON, alertas e teste CI com PostgreSQL/TLS seguem pendentes.

As alterações desta finalização são locais e ainda não foram publicadas no remoto.

## Fechamento da Sprint 1 da O10

Os itens de fundação e integração logística estão implementados no workspace: agregação do inventário em uma consulta, cliente HTTP dos Correios, provedor de token com invalidação segura, resolução imutável dos parâmetros do servidor, snapshot logístico versionado e cooldown do frontend para 429/503. A validação de permissões existente e o checkout por `ShippingQuote` foram preservados. Cache compartilhado e lock Redis foram antecipados para esta entrega, com testes entre processos e orçamento baseado no Free.

O fechamento está pronto para revisão, com testes automatizados e validação manual local concluídos. Permanece sem commit e sem publicação no remoto; integrações comerciais reais não foram acionadas.

### Critérios de fechamento

| Item da Sprint 1 | Entrega e evidência | Estado |
| --- | --- | --- |
| Inventário administrativo | Rota existente preservada com `CanManageCatalog`; testes de permissões passaram. | Concluído |
| Agregação de estoque | `get_inventory_summary()` usa `Sum` e retorna zero para produtos sem variações; teste confirma uma única consulta. | Concluído |
| Cliente HTTP dos Correios | `CorreiosClient` centraliza host, cabeçalhos e transporte; funções públicas existentes continuam como adaptadores. | Concluído |
| Ciclo de token | `CorreiosTokenProvider` centraliza leitura/renovação com cache e lock Redis compartilhados; concorrência entre processos, perda de cache e falhas testadas. | Concluído localmente; conectar a instância Free no deploy |
| Parâmetros logísticos | `ShippingParameters` imutável e `resolve_shipping_parameters()` validam os parâmetros do servidor; a rota pública rejeita origem/peso/serviço do cliente. | Concluído |
| Cotação e checkout | Cálculo e snapshot usam os parâmetros validados, incluindo dimensões, valor declarado e versão da política; idempotência e estoque validados. | Concluído |

**Decisão de arquitetura atualizada em 21/10/2026:** implementar cache de token e lock distribuído já na Sprint 1, usando os limites do Render Key Value Free (25 MB / 50 conexões). A hipótese de usar PostgreSQL como cache foi descartada. Quotas futuras não podem assumir persistência de contadores no Free. Ainda não houve provisionamento nem deploy da instância Render.

**Destino de implantação informado:** frontend na Vercel e backend no Render. A futura instância Redis será compartilhada pelos workers do backend. O ambiente publicado e as variáveis do Render ainda não foram verificados; esta entrega não comprova capacidade para 10 mil usuários simultâneos.

## Comparação com o backlog informado

| Backlog da Sprint 3 | Estado e reaproveitamento | Relação com O10 / cuidado para evitar conflito |
| --- | --- | --- |
| Squad 1 — O10 | Fundação logística, cache e lock Redis implementados localmente; limites, quota e observabilidade continuam pendentes nas sprints seguintes. | O diff preserva os fluxos existentes de checkout, cotações, permissões e integração com InfinitePay. |
| Squad 1 — página pública `/drop/:slug` | Backend já possui `DropCampaign`, endpoints públicos de listagem/detalhe e serializer com produtos. A aplicação `frontend/dev` ainda não tem rota/página `/drop/:slug`, contador regressivo ou quantidade restante. | É tarefa separada da O10. Reaproveitar os endpoints/modelo; não criar novo modelo de campanha. A implementação poderá tocar `products/urls.py`/`products/views.py` se algum ajuste de API for necessário, arquivos também usados pela otimização do inventário da O10. |
| Squad 2 — trocas e devoluções | Não foi encontrado `ReturnRequest` nem fluxo administrativo de solicitação. `PaymentStatus.REFUNDED` já existe; `restore_order_stock(order, changed_by, physical_return=True)` registra retorno de estoque no histórico. | Não duplicar enum nem rotina de movimentação de estoque. O fluxo de devolução deve orquestrar aprovação, estorno confirmado e retorno físico usando os recursos existentes. Divide `orders/models.py` e `orders/services.py` com os campos e diagnósticos de `CheckoutAttempt` da O10; coordenar alterações por commits pequenos e integração revisada. |
| Squad 2 — métricas detalhadas de usuários | Backend `analytics` já contém eventos, endpoints e consultas de visão geral/timeline. `frontend/dev` não contém o painel correspondente. | Parte do backend já está pronta. Existe um branch local `feat/metricas-de-usuario` divergente de `dev` (6 commits à frente e 4 atrás no momento da análise), com componentes de consentimento/analytics e seção comportamental. Revisar e integrar seletivamente; não substituir o `dev` pelo branch. |
| Squad 3 — newsletter | A inscrição pública, consentimento e formulário `NewsletterBand` já existem no remoto. A nova issue #65 trata envio de e-mails pelo painel e está aberta, sem PR correspondente encontrado nesta consulta. | Reutilizar a inscrição existente. Não confundir a inscrição concluída com a nova campanha administrativa ainda sem conclusão verificável. |
| Squad 3 — “avise-me quando chegar” por variação | Implementação e evidências da issue #66 disponíveis; backend PR #31 e frontend PR #28 abertos em 21/10, ainda fora de `dev`. | O backend toca `products/services.py` e `products/views.py`; preservar a agregação do inventário ao integrar. Testes de estoque da O10 não substituem os testes de envio de avisos. |
| Squad 3 — aviso de abertura do drop | Não foi encontrado aviso ligado à abertura. | Depende da lista de espera do Squad 4. Usar o modelo/fluxo da waitlist se ele for concluído; não criar uma segunda lista. |
| Squad 4 — guia de medidas por categoria | Não foi encontrada tabela/guia de medidas no frontend ou modelo correspondente. | Separado da O10. Manter dimensões de embalagem do cálculo logístico fora deste escopo, salvo requisito explícito. |
| Squad 4 — `DropWaitlist` | Não foi encontrado modelo/fluxo de lista de espera. | Dependência direta do aviso de abertura do Squad 3; combinar um único modelo/contrato. Não confundir com newsletter, que não é segmentada por drop. |
| Squad 4 — recomendação de comunidade e contato | Não foi encontrado fluxo de recomendação/contato com usuário. | Sem sobreposição de domínio com O10; pode reutilizar o serviço de e-mail existente. |
| Squad 4 — recompra rápida | Não foi encontrada ação “comprar de novo”. Carrinho e serviços de adição de itens já existem. | Reutilizar adição ao carrinho; recalcular preços, estoque, descontos e frete no checkout. Não copiar totais do pedido antigo. Pode compartilhar `orders/services.py` com as mudanças de O10 e devoluções. |

## Arquivos com maior risco de conflito

- `backend/products/views.py`: O10 pode otimizar inventário; a página de drop pode demandar mudança de API. Separar funções e revisar o diff conjunto.
- `backend/orders/models.py` e `backend/orders/services.py`: O10 adiciona rastreabilidade a `CheckoutAttempt`; trocas/devoluções e recompra também tendem a tocar esses módulos. Preservar migrações pequenas e evitar alterações sobrepostas na mesma função.
- `frontend/src/pages/public/PaymentPage/index.jsx`: O10 ajusta erros 429/503; o branch de métricas também inclui instrumentação na página. Integrar os dois comportamentos sem perder a UX de cotação existente.
- Serviço comum de notificações: reposição, abertura de drop e comunidade devem chamar o serviço existente, sem criar transportes concorrentes.
- `orders/migrations/0013_checkoutattempt_diagnostics.py` e `orders/migrations/0013_couponemailsend.py` do PR #30: são migrations paralelas que partem de `0012`. Ao integrar os dois trabalhos, criar/revisar uma migration de merge preservando ambos; não sobrescrever nem renumerar um arquivo já aplicado em outro ambiente.

## Ordem recomendada de integração

1. Entregar a O10 nos pontos de infraestrutura e frete, preservando a validação e a cotação de checkout já existentes.
2. Integrar separadamente a interface de analytics que está no branch divergente, resolvendo o trecho compartilhado de `PaymentPage`.
3. Implementar devolução/reembolso usando `PaymentStatus.REFUNDED` e `restore_order_stock`, com distinção explícita entre estorno financeiro e retorno físico.
4. Fazer `DropWaitlist` preceder o aviso de abertura do drop; a página pública pode avançar em paralelo usando o endpoint de campanha existente.
5. Tratar newsletter como concluída; conectar reposição e comunidade às infraestruturas existentes, sem duplicar inscrição ou envio.

## Referências do código remoto

- Backend: `products/views.py`, `products/urls.py`, `orders/correios_views.py`, `orders/correios.py`, `orders/models.py`, `orders/services.py`, `core/settings/base.py`, `core/settings/prod.py`, `entrypoint.sh`, `analytics/` e `authentication/views.py`.
- Frontend: `src/pages/public/PaymentPage/`, `src/components/ui/ShioDesign.jsx` e `src/components/layout/shared/Footer.jsx`.
- Documentação: `docs/sprints/sprint_2/squad_1/o10-evidencias.md` e `docs/sprints/sprint_3/backlog.md`.

## Organização dos commits — 22/10/2026

Os commits abaixo preservam o código validado em 21/10. A separação não altera o comportamento do sistema e não corrige a falha de carregamento inicial registrada na validação. Nenhum push ou PR foi realizado nesta etapa.

| Repositório | Commit | Responsabilidade |
| --- | --- | --- |
| Backend | `6997b4d` | Agregação do inventário em uma consulta, mantendo permissões e teste de estoque vazio. |
| Backend | `1127ab3` | PostgreSQL obrigatório com TLS, espera pelo banco configurado e provisionamento explícito do administrador. |
| Backend | `e1dbf01` | Diagnóstico da tentativa de checkout, migration, referência de requisição e exposição de cabeçalhos via CORS. |
| Backend | `bc9bc69` | Parâmetros e snapshot logísticos, cliente Correios, token/lock Redis, dependência, Compose, CI e testes. |
| Backend | `6e30d8b` | Instruções de política logística e operação do Redis Free. |
| Frontend | `17ef914` | Tratamento de 429/503 e Retry-After no cálculo e checkout, com testes e a reformatação existente da página. |
| Documentação | `docs(o10): registrar auditoria, validacao e capturas da etapa 1` | Auditoria, comparação, validação, doze capturas, metadados e navegação da sprint. |

Aplicar os commits do backend na ordem acima. O commit de logística depende dos cabeçalhos incluídos no diagnóstico; a documentação operacional descreve a configuração resultante. Frontend e backend devem ser revisados juntos pelo contrato de erros e cabeçalhos.

Os metadados das capturas mantêm os HEADs e o indicador de alterações locais do momento da captura, anterior a estes commits. Não foram reexecutadas as suítes nem feita nova captura nesta organização; os resultados de 21/10 permanecem históricos.
