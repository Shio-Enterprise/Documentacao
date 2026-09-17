<a id="o5-catalogo-busca-e-paginacao-server-side"></a>
## O2: Catálogo, busca e paginação server-side

**Trio:** Amanda, Felipe e Cauã

**Por que a melhoria foi relevante?**

Conforme identificado na [issue #25](https://github.com/Shio-Enterprise/Documentacao/issues/25), o catálogo ignorava a categoria definida na rota, carregava somente a primeira página de produtos e executava busca, filtros, ordenação e paginação no front-end. Além disso, “Mais vendidos” não utilizava vendas reais e as recomendações não consideravam categoria, drop e disponibilidade. Para resolver esses problemas, o catálogo passou a consultar o backend com os parâmetros de busca, filtros, ordenação e paginação, mantendo o estado na URL e respeitando o slug da categoria. Também foi implementado o ranking de produtos com base nas quantidades de pedidos válidos e um endpoint de recomendações que considera categoria, drop, vendas e estoque, mantendo produtos inativos fora das listagens públicas.

**Evidências (Pull Requests):**

- [Frontend PR #4](https://github.com/Shio-Enterprise/frontend/pull/6)
- [Backend PR #3](https://github.com/Shio-Enterprise/backend/pull/5)

**Evidências (Prints):**

Rota de categoria carregando os produtos correspondentes:

![Rota de categoria](../../../assets/evidencias-o5/01-rota-categoria.png)

Paginação server-side com a página 2 selecionada:

![Paginação server-side](../../../assets/evidencias-o5/02-paginacao.png)

Filtros, busca, ordenação e página enviados na consulta da API:

![Consulta server-side](../../../assets/evidencias-o5/03-consulta-server-side.png)

Recomendações carregadas pelo endpoint específico do produto:

![Recomendações por produto](../../../assets/evidencias-o5/04-mais-vendidos.png)

Catálogo ordenado pelo ranking de mais vendidos:

![Mais vendidos](../../../assets/evidencias-o5/05-recomendacoes.png)