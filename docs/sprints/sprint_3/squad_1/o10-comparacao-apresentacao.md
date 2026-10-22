# O10 — comparação de entregas e preparação da apresentação

**Consulta:** 21/10/2026. **Responsável analisado:** Matheus de Alcântara (`matheusdealcantara`), identificado pela configuração Git e pelos PRs. A Sprint 3 do grupo encerra em 27/10; isso não confirma a data/horário da apresentação.

## Parecer

**A etapa 1 da O10 tem conteúdo técnico suficiente para uma apresentação individual de sprint**, considerando fundação logística, segurança dos parâmetros, inventário em uma consulta, cache/lock Redis entre processos e tratamento de falhas no checkout. Tem implementação e validação; não é somente planejamento.

O principal ponto a concluir antes da apresentação é a **formalização da entrega**: publicar os commits locais, abrir PRs e inserir as evidências na apresentação. As [12 capturas no Chrome já estão documentadas](sprints/sprint_3/squad_1/o10-evidencias-sprint-1.md), incluindo a saída do teste Redis. Os commits foram separados em 22/10; a implementação continua local e a instância Render ainda não foi criada/conectada por esta sessão. Não apresentar a O10 inteira, o deploy ou suporte a 10 mil usuários como concluídos.

Esse parecer avalia evidência técnica; não substitui a rubrica de avaliação do professor, que não está nas fontes consultadas. Entregas anteriores demonstram continuidade, mas não devem ser contadas novamente como trabalho da sprint atual.

## Como a comparação foi feita

- Histórico dos três repositórios, branches remotos atualizados e estados dos PRs consultados pela API do GitHub em 21/10.
- Documentação de evidências das Sprints 1, 2 e 3; `Documentacao/main` atualizado até `da53105`.
- Código local da O10 sobre `backend/dev e0541f8` e `frontend/dev ae769fd`.
- Comparação por comportamento entregue, testes relevantes, possibilidade de demonstrar e rastreabilidade. Quantidade de linhas, commits e o total de testes do projeto não medem sozinhos contribuição individual.
- Os testes dos PRs dos colegas não foram reexecutados isoladamente nesta análise. Seus registros de validação são identificados como evidências dos próprios trabalhos.

## Entregas atuais dos outros integrantes

| Responsáveis / entrega | Evidência verificável em 21/10 | Comparação com a O10 |
| --- | --- | --- |
| Ian / Arthur / Danilo — exportação CSV/XLSX, #62 | [Backend #29](https://github.com/Shio-Enterprise/backend/pull/29) e [frontend #26](https://github.com/Shio-Enterprise/frontend/pull/26) integrados; issue fechada. Evidências de filtros, permissões, sanitização de fórmulas, arquivos e testes manuais. | Uma funcionalidade completa com resultado visível e PRs integrados. O10 tem complexidade operacional e de concorrência comparável a uma entrega técnica substancial, mas ainda precisa de PR. |
| Ian / Arthur / Danilo — cupom por e-mail, #67 | [Backend #30](https://github.com/Shio-Enterprise/backend/pull/30) e [frontend #27](https://github.com/Shio-Enterprise/frontend/pull/27) abertos; documentação com envio, consentimento, descadastro, histórico e capturas. Ainda não está em `dev`. | É um fluxo completo próprio. A O10 não deve reimplementar marketing ou tratar o código desse PR como integrado. |
| Ian / Arthur / Danilo — aviso de reposição por variação, #66 | [Backend #31](https://github.com/Shio-Enterprise/backend/pull/31) e [frontend #28](https://github.com/Shio-Enterprise/frontend/pull/28) abertos; documentação com fluxo de inscrição/reposição/e-mail e capturas. Ainda não está em `dev`. | Também envolve concorrência, estoque e envio externo. Requer integração cuidadosa com `products/services.py` e `products/views.py` alterados pela O10. |
| Demais squads — devoluções, página de drop, medidas, waitlist, comunidade e recompra | Itens informados no backlog da conversa. Não encontrei PRs recentes desses itens entre os PRs consultados de backend/frontend. | Não é possível atribuir conclusão ou ausência de trabalho sem evidência adicional. Evitar ranking de pessoas baseado apenas no que foi publicado. |

O trio da Squad 3 tem **três funcionalidades com evidências na sprint**, sendo uma integrada e duas em revisão. A O10 é uma **etapa de uma melhoria maior**. Isso permite defender a suficiência da sua entrega individual, mas não demonstra equivalência automática entre a produção total das duas equipes.

As issues [#64, responsividade/acessibilidade](https://github.com/Shio-Enterprise/Documentacao/issues/64), e [#65, envio administrativo de newsletter](https://github.com/Shio-Enterprise/Documentacao/issues/65), também estão abertas e atribuídas ao trio, mas não foram contadas como entregas concluídas nesta análise.

Referências documentais do trio: [exportação](../squad_3/exportacao-dados-evidencias.md), [cupom por e-mail](../squad_3/envio-cupom-email-evidencias.md) e [aviso de reposição](../squad_3/avise-me-evidencias.md).

## Referência das sprints anteriores dos colegas

| Frente | Evidência de integração | O que serve como padrão de entrega |
| --- | --- | --- |
| Avaliações e e-mails — Arthur / Ian / Danilo | [Reviews backend #13](https://github.com/Shio-Enterprise/backend/pull/13), [frontend #13](https://github.com/Shio-Enterprise/frontend/pull/13), [e-mails backend #15](https://github.com/Shio-Enterprise/backend/pull/15) e [recuperação de senha #16](https://github.com/Shio-Enterprise/backend/pull/16) integrados. | Regra de negócio, validação, interface e evidências do fluxo completo. |
| Administração e pagamentos — Amanda / Felipe / Cauã | [Dashboard backend #20](https://github.com/Shio-Enterprise/backend/pull/20), [frontend #18](https://github.com/Shio-Enterprise/frontend/pull/18), [permissões backend #21](https://github.com/Shio-Enterprise/backend/pull/21) e [pagamentos backend #17](https://github.com/Shio-Enterprise/backend/pull/17) integrados. | Permissões, consistência dos dados e estados reais de pagamento, sem confundir correções herdadas com trabalho novo. |
| Cupons e reservas — João Gabriel / João Ramos | [Cupom no checkout #23](https://github.com/Shio-Enterprise/backend/pull/23), [expiração #24](https://github.com/Shio-Enterprise/backend/pull/24), [CRUD #28](https://github.com/Shio-Enterprise/backend/pull/28) e [frontend #25](https://github.com/Shio-Enterprise/frontend/pull/25) integrados. | Testes de concorrência, preservação de estoque e uma entrega demonstrável. |

Essas referências ajudam a comparar qualidade e fechamento, não horas trabalhadas ou produtividade por pessoa.

## Suas contribuições anteriores

| Entrega | Sua contribuição verificável | Estado atual e relação com a apresentação |
| --- | --- | --- |
| Acesso administrativo complementar, #20 | [Backend #1](https://github.com/Shio-Enterprise/backend/pull/1), [frontend #1](https://github.com/Shio-Enterprise/frontend/pull/1) e [documentação #27](https://github.com/Shio-Enterprise/Documentacao/pull/27), de sua autoria. | Integrados; uma correção delimitada que habilitou o acesso ao painel. O10 é uma entrega maior em integração, concorrência e configuração. |
| O7 — dashboard e CRM | [Backend #8](https://github.com/Shio-Enterprise/backend/pull/8), [frontend #9](https://github.com/Shio-Enterprise/frontend/pull/9) e [documentação #30](https://github.com/Shio-Enterprise/Documentacao/pull/30), de sua autoria; commits de `paid_at`, regras de receita, CRM e dashboard no histórico integrado. | Integrados. A evidência antiga dizia que o backend aguardava aprovação em 15/09; o estado atual do GitHub confirma integração em 16/09. É o melhor parâmetro anterior de uma entrega sua abrangente. |
| Favoritos de produtos, #37 | [Backend #18](https://github.com/Shio-Enterprise/backend/pull/18), [frontend #16](https://github.com/Shio-Enterprise/frontend/pull/16) e [documentação #50](https://github.com/Shio-Enterprise/Documentacao/pull/50), com commits seus de API, experiência visual e fixtures. | Integrados; inclui documentação extensa e capturas reais. A O10 deve alcançar o mesmo nível de rastreabilidade do resultado, mesmo tendo menos mudanças visuais. |
| Métricas comportamentais, #38 | Você abriu [backend #22](https://github.com/Shio-Enterprise/backend/pull/22) e [frontend #19](https://github.com/Shio-Enterprise/frontend/pull/19). Os commits do domínio de analytics no backend incluem implementação de Vilmar; é trabalho compartilhado, não autoria individual sua integral. | Backend integrado. Frontend aberto, `MERGEABLE`, `REVIEW_REQUIRED`, CI/Vercel com sucesso na consulta. Não apresentar a interface como integrada; obter revisão desse PR é uma pendência de fechamento útil. |
| O3 — disponibilidade dos drops | Documentação registra a dupla Matheus/Vilmar; [backend #7](https://github.com/Shio-Enterprise/backend/pull/7) foi aberto por Vilmar e integrado. | Pode ser citado como entrega da dupla. As fontes consultadas não sustentam atribuir toda a implementação individualmente a você. |

## O que é novo na sua entrega da O10

1. Inventário com uma consulta, preservando o contrato e `CanManageCatalog` que já existiam.
2. Cliente HTTP dos Correios e provedor de token centralizados, sem duplicar o fluxo existente de checkout.
3. Parâmetros logísticos imutáveis e snapshot com dimensões, valor declarado e versão da política; rejeição dos parâmetros controlados enviados pelo cliente.
4. Cache Django no alias `correios` e lock Redis entre processos. Oito acessos em quatro processos compartilham uma única renovação no teste.
5. Compatibilidade com os limites do Free: pools de até 30 conexões nos três workers atuais, chaves com TTL, `noeviction`, timeouts e falha controlada.
6. Tratamento de 429/503 com `Retry-After`, exposição dos cabeçalhos via CORS e confirmação da cotação invalidada ao mudar a compra.
7. Evidências de testes automatizados, falhas simuladas e checkout `UNCERTAIN` sem duplicação. A base local também contém TLS obrigatório, startup sem bootstrap automático e campos de diagnóstico; esses avanços não significam que toda a observabilidade foi concluída.

**Não contar como criação sua nesta etapa:** autenticação JWT, `CanManageCatalog`, idempotência, modelo `ShippingQuote`, cálculo comercial de cupons, ledger, disponibilidade dos drops, reembolso e a suíte inteira do projeto. Foram reutilizados e precisam permanecer corretos.

## Preparação objetiva da apresentação

| Critério | Avaliação |
| --- | --- |
| Implementação de uma etapa coerente | Atendido localmente: logística e ciclo de token compartilhado. |
| Testes de comportamento relevante | Atendido: contrato, concorrência, invalidação, perda de cache e erro sem chamada externa desprotegida. Ver [registro de validação](./o10-validacao-sprint-1.md). |
| Demonstração | Preparável localmente com dados fictícios e Redis descartável. Não requer contrato Correios nem cobrança real. |
| Rastreabilidade no GitHub | Parcial: commits locais organizados em 22/10; publicação e PRs pendentes. Isso é uma diferença importante em relação aos favoritos/O7 e à exportação do trio. |
| Deploy Render | Pendente: criar/conectar Key Value **Free**, política `noeviction`, mesma região e `REDIS_URL` apenas no backend. |
| O10 completa | Não: ainda faltam limites/quota, observabilidade, bootstrap validado e controles de produção/CI completos. |

### Roteiro de 5–7 minutos

1. **Problema e responsabilidade — 45 s:** explicar manipulação dos parâmetros de frete, renovação concorrente e inventário; delimitar esta etapa da O10.
2. **Antes/depois — 90 s:** mostrar o inventário protegido, uma consulta agregada e a rejeição de origem/peso/serviço do cliente.
3. **Redis — 90 s:** executar `TEST_REDIS_URL=<Redis local descartável> pytest -q orders/test_redis_shipping.py`; destacar o teste de oito acessos/quatro processos/uma renovação. Explicar que 50 conexões Redis não significa 50 usuários da loja.
4. **Checkout — 90 s:** mostrar revisão, confirmação, mudança de quantidade e bloqueio por `Retry-After`; usar falhas simuladas e evidências da validação manual, sem enviar pagamento.
5. **Limites e próximos passos — 60 s:** dizer que o Free perde dados em reinícios, que quota crítica não pode depender apenas disso e que as próximas etapas fecham limites e observabilidade.

Antes de apresentar, anexar os PRs da O10 quando forem criados e selecionar as capturas já documentadas; incluir a correção de carregamento inicial revalidada em 22/10. Não adicionar outra funcionalidade grande apenas para aumentar a contagem de tarefas; priorizar fechar a evidência da O10 e revisar o PR de métricas pendente.

## Integração com trabalhos em revisão

- O PR #30 do backend cria `orders/0013_couponemailsend`; a O10 cria `orders/0013_checkoutattempt_diagnostics`. São alterações aditivas distintas, mas terão duas migrations irmãs após integrar os branches. Criar/revisar uma migration de merge que preserve as duas; não apagar uma entrega para aceitar a outra.
- O aviso de reposição altera os serviços/views de produto: preservar o fluxo `move_stock` e a agregação do inventário da O10.
- A interface de métricas modifica `PaymentPage`: preservar instrumentação e tratamento de `Retry-After` na integração.
- Só haverá comprovação de ausência de regressão conjunta após integração e nova execução dos testes. Esta análise não afirma que os branches em revisão já foram integrados.
