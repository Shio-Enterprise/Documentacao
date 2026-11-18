## Máscaras de telefone e CPF — Formato único em Meus Dados, no banco e no pagamento
**Trio:** Amanda, Felipe e Cauã

**Origem:**
- [Issue #111](https://github.com/Shio-Enterprise/Documentacao/issues/111) — mostrar máscara de telefone e CPF enquanto a pessoa digita em Meus Dados e guardar um formato único do telefone no banco.

**Por que a melhoria foi relevante?**
Telefone e CPF eram digitados em **Meus Dados** sem formato definido. O telefone aceitava qualquer texto e seguia como veio até o pagamento na InfinitePay. A entrega mostra a máscara enquanto a pessoa digita, `(61) 99999-9999` para celular, `(61) 3333-4444` para fixo e `000.000.000-00` para CPF, e passa a validar o telefone brasileiro no backend, gravando só os dígitos. Os telefones antigos válidos são padronizados por migração; os fora do padrão não são apagados, aparecem como estão e bloqueiam o checkout até a pessoa corrigir. O telefone vai para a InfinitePay no formato internacional (`+55`). A validação e a normalização do CPF no backend já existiam desde a [#91](https://github.com/Shio-Enterprise/Documentacao/issues/91); aqui o CPF ganha só a máscara.

**Regras implementadas:**
- A máscara se forma a cada tecla e também é aplicada quando a página carrega, padronizando a exibição de dados antigos.
- Um `+55` colado ou preenchido pelo navegador é aceito e removido. Os campos não têm `maxLength`, para não cortar um número colado com `+55`.
- O backend exige DDD e 10 ou 11 dígitos: celular começa com 9 e fixo com 2 a 5. Aceita o número com ou sem pontuação e com `+55`.
- A API grava só os dígitos e devolve o telefone formatado. Campo vazio vira `NULL`.
- Telefone inválido retorna `400` em `phone_number` e nada é salvo. Quando falta o 9 do celular, a mensagem diz isso.
- Telefone ou CPF antigo fora do padrão aparece como está, sem a máscara inventar um número.
- No pagamento, telefone ausente ou inválido bloqueia o botão e mostra um link para corrigir em Meus Dados.
- O checkout envia o telefone para a InfinitePay como `+55DDDNÚMERO`.

**Migração dos dados antigos:**
A migração `authentication.0010_normalize_profile_phone` padroniza os telefones antigos válidos. Os inválidos ficam como estão, e o `migrate` lista o e-mail e o id de cada perfil no log `[Telefone]`, sem mostrar o número. Segue o mesmo esquema da migração de CPF da #91. Antes do deploy, a migração deve ser executada numa cópia do banco de produção, com revisão do log `[Telefone]` e um pagamento de teste em homologação.

**Validação automatizada:**
- Backend: `authentication/test_phone.py` (validação e gravação), `authentication/test_phone_migration.py` (normaliza o válido, preserva o inválido, limpa o vazio) e o payload da InfinitePay em `orders/tests.py`.
- Frontend: `src/lib/masks.test.js` (celular, fixo, `+55` e CPF, na digitação e na exibição de valor vindo da API), `MyAccountPage/index.test.jsx` e `PaymentPage/index.test.jsx` (bloqueio com telefone ausente ou inválido).

**Evidências (Pull Requests):**

- [Frontend PR #62](https://github.com/Shio-Enterprise/frontend/pull/62)
- [Backend PR #53](https://github.com/Shio-Enterprise/backend/pull/53)

**Evidências (prints):**

### Máscaras em Meus Dados

_Descrever: campos de telefone (celular) e CPF em Meus Dados com a máscara aplicada durante a digitação._

> **Imagem pendente:** `assets/evidencias-mascaras/01-meus-dados-mascaras.png`

<!-- ![Telefone e CPF com máscara em Meus Dados](../../../assets/evidencias-mascaras/01-meus-dados-mascaras.png) -->

_Descrever: telefone fixo formatado como `(61) 3333-4444` e número colado com `+55`, com o prefixo removido._

> **Imagem pendente:** `assets/evidencias-mascaras/02-fixo-e-mais55.png`

<!-- ![Telefone fixo e número colado com +55](../../../assets/evidencias-mascaras/02-fixo-e-mais55.png) -->

### Telefone inválido recusado

_Descrever: mensagem de erro ao salvar um telefone inválido e a mensagem específica de celular sem o 9._

> **Imagem pendente:** `assets/evidencias-mascaras/03-telefone-invalido.png`

<!-- ![Mensagem de telefone inválido e de celular sem o 9](../../../assets/evidencias-mascaras/03-telefone-invalido.png) -->

### Telefone salvo só com dígitos

_Descrever: perfil no banco (ou admin do Django) com o telefone gravado só com dígitos e a resposta da API devolvendo o valor formatado._

> **Imagem pendente:** `assets/evidencias-mascaras/04-telefone-gravado-digitos.png`

<!-- ![Telefone gravado só com dígitos e devolvido formatado](../../../assets/evidencias-mascaras/04-telefone-gravado-digitos.png) -->

### Checkout bloqueado com telefone inválido

_Descrever: página de pagamento com o aviso de telefone incompleto ou inválido, o link para Meus Dados e o botão de pagamento desabilitado._

> **Imagem pendente:** `assets/evidencias-mascaras/05-checkout-telefone-invalido.png`

<!-- ![Checkout bloqueado por telefone inválido](../../../assets/evidencias-mascaras/05-checkout-telefone-invalido.png) -->

### Telefone enviado à InfinitePay com +55

_Descrever: payload enviado à InfinitePay com o telefone no formato `+55DDDNÚMERO`._

> **Imagem pendente:** `assets/evidencias-mascaras/06-payload-infinitepay.png`

<!-- ![Payload da InfinitePay com o telefone no formato +55](../../../assets/evidencias-mascaras/06-payload-infinitepay.png) -->

### Migração dos telefones antigos

_Descrever: saída do `migrate` com o log `[Telefone]` listando e-mail e id dos perfis fora do padrão, sem exibir o número._

> **Imagem pendente:** `assets/evidencias-mascaras/07-migracao-log-telefone.png`

<!-- ![Log da migração de telefones antigos](../../../assets/evidencias-mascaras/07-migracao-log-telefone.png) -->
