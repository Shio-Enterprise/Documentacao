# Evidências

## Sprint 1

## Login Tradicional e Segurança de Auth
**Trio:** Ian, Arthur, Danilo

**Por que a melhoria foi relevante?** 
Implementamos a autenticação tradicional (E-mail e Senha) para acabar com a dependência exclusiva de contas do Google. Isso democratizou o acesso à plataforma para usuários corporativos e outros provedores. Ao mesmo tempo, corrigimos brechas críticas de segurança: fechamos o roteamento administrativo que estava exposto, implementamos o encerramento real da sessão via backend (Logout API) e arrumamos o sistema de privilégios (`is_staff`).

**Evidências (Pull Requests):**
- [Frontend PR #2](https://github.com/Shio-Enterprise/frontend/pull/2)
- [Backend PR #2](https://github.com/Shio-Enterprise/backend/pull/2)

## Promessas comerciais sem suporte no backend
**Trio:** Ian, Arthur e Danilo

**Por que a melhoria foi relevante?**
Seis promessas da UI não tinham suporte real no backend (levantado na [issue #18](https://github.com/Shio-Enterprise/Documentacao/issues/18), decisão do cliente na [issue #19](https://github.com/Shio-Enterprise/Documentacao/issues/19#issuecomment-5618776911)). Implementamos o desconto automático de boas-vindas (10% na primeira compra), a newsletter real com consentimento LGPD, corrigimos os selos de pagamento para refletir o gateway real (InfinitePay: Pix, Cartão, Boleto) e removemos promessas falsas: links de termos/privacidade quebrados, estrelas de avaliação fixas (mockadas) e a promessa de e-mail de confirmação que nunca era enviado.

**Evidências (Pull Requests):**
- [Frontend PR #4](https://github.com/Shio-Enterprise/frontend/pull/4)
- [Backend PR #3](https://github.com/Shio-Enterprise/backend/pull/3)

**Evidências (prints):**

Banner de boas-vindas atualizado para 10%:

![Banner 10% de desconto](assets/evidencias-o9/01-banner-10.jpg)

Rodapé: newsletter com consentimento LGPD e selos Pix/Cartão/Boleto:

![Newsletter e selos de pagamento](assets/evidencias-o9/02-footer-newsletter-badges.jpg)

Login sem links quebrados de termos/privacidade (texto simples, sem `<Link>`):

![Login sem links de termos](assets/evidencias-o9/03-login-sem-links.jpg)

Carrinho aplicando o desconto de boas-vindas automaticamente (sem campo de cupom manual):

![Carrinho com desconto automático](assets/evidencias-o9/04-carrinho-desconto.jpg)

Card de produto sem estrelas de avaliação fixas:

![Card sem estrela](assets/evidencias-o9/05-card-sem-estrela.jpg)

<a id="o5-catalogo-busca-e-paginacao-server-side"></a>
## Catálogo, busca e paginação server-side

**Trio:** Amanda, Felipe e Cauã

**Por que a melhoria foi relevante?**

Conforme identificado na [issue #25](https://github.com/Shio-Enterprise/Documentacao/issues/25), o catálogo ignorava a categoria definida na rota, carregava somente a primeira página de produtos e executava busca, filtros, ordenação e paginação no front-end. Além disso, “Mais vendidos” não utilizava vendas reais e as recomendações não consideravam categoria, drop e disponibilidade. Para resolver esses problemas, o catálogo passou a consultar o backend com os parâmetros de busca, filtros, ordenação e paginação, mantendo o estado na URL e respeitando o slug da categoria. Também foi implementado o ranking de produtos com base nas quantidades de pedidos válidos e um endpoint de recomendações que considera categoria, drop, vendas e estoque, mantendo produtos inativos fora das listagens públicas.

**Evidências (Pull Requests):**

- [Frontend PR #4](https://github.com/Shio-Enterprise/frontend/pull/6)
- [Backend PR #3](https://github.com/Shio-Enterprise/backend/pull/5)

**Evidências (Prints):**

Rota de categoria carregando os produtos correspondentes:

![Rota de categoria](assets/evidencias-o5/01-rota-categoria.png)

Paginação server-side com a página 2 selecionada:

![Paginação server-side](assets/evidencias-o5/02-paginacao.png)

Filtros, busca, ordenação e página enviados na consulta da API:

![Consulta server-side](assets/evidencias-o5/03-consulta-server-side.png)

Recomendações carregadas pelo endpoint específico do produto:

![Recomendações por produto](assets/evidencias-o5/04-mais-vendidos.png)

Catálogo ordenado pelo ranking de mais vendidos:

![Mais vendidos](assets/evidencias-o5/05-recomendacoes.png)
