# Favoritos de produtos

Especificação técnica e registro da implementação da [issue #37](https://github.com/Shio-Enterprise/Documentacao/issues/37).

## Modelo e persistência

`Wishlist` pertence ao app `products` e representa um vínculo entre o usuário autenticado e um produto, sem tamanho ou cor. Possui identificador UUID, `user`, `product` e `created_at`. Uma restrição única no banco impede dois vínculos para o mesmo par. As duas relações usam exclusão em cascata.

O backend é a fonte de verdade. Favoritar não movimenta estoque, não reserva unidades, não congela preço e não altera o carrinho.

## Contrato HTTP

Todas as rotas exigem autenticação JWT e operam apenas sobre os favoritos do usuário autenticado.

| Método e rota                                | Entrada                 | Resposta                                                  |
| -------------------------------------------- | ----------------------- | --------------------------------------------------------- |
| `GET /api/catalog/wishlist/`                 | `page`, `page_size`     | Lista paginada com `count`, `next`, `previous`, `results` |
| `GET /api/catalog/wishlist/ids/`             | —                       | `{ "product_ids": [...] }`, sem limitação à página atual  |
| `POST /api/catalog/wishlist/`                | `{ "product": "UUID" }` | Vínculo criado (`201`) ou existente (`200`)               |
| `DELETE /api/catalog/wishlist/<product_id>/` | —                       | `204`, inclusive se o vínculo já não existir              |

Cada item da listagem contém `id`, `created_at` e `product`, com a representação de produto usada pelo catálogo. A ordenação é da inclusão mais recente para a mais antiga, com desempate estável por identificador.

O usuário não é recebido como proprietário pelo payload. A remoção procura pelo produto e pelo usuário atual, inclusive quando o produto deixa de ser visível. A consulta de IDs é usada pelos cards para evitar uma requisição individual por produto.

## Visibilidade e disponibilidade

- Produtos ativos sem drop ou com drop público podem ser adicionados e exibidos.
- Falta de estoque ou indisponibilidade de venda não apagam um favorito. A interface sinaliza a indisponibilidade considerando as variações e as regras do drop.
- Produtos inativos ou com drop privado são omitidos da lista e da consulta de IDs; os vínculos permanecem no banco para quando voltarem a ser públicos.
- A listagem de favoritos não reutiliza o filtro de estoque positivo aplicado ao catálogo público.
- Dados atuais do produto determinam imagem, preço e disponibilidade; não há cópia histórica desses campos no favorito.

## Frontend

Um contexto de favoritos integra o cliente Axios autenticado e o contexto de autenticação. Os cards compartilham os IDs conhecidos, as operações pendentes por produto e as atualizações de estado. O botão de coração fica separado do link do produto e informa seu estado por `aria-pressed`.

A página privada `/my-favorites` usa o layout de conta existente. Oferece paginação, remoção, carregamento, nova tentativa após erro e acesso à loja quando vazia. O menu é incluído nas versões desktop e mobile.

Visitantes são encaminhados ao login com a localização de origem. A inclusão não é executada automaticamente após o login: o cliente retorna e pode favoritar o produto.

Logout, expiração e troca de conta invalidam o estado local. Operações assíncronas devem conferir a sessão antes de aplicar respostas para impedir que dados de uma conta anterior apareçam na sessão seguinte. Um clique pendente bloqueia novas operações para aquele produto; falhas não são apresentadas como sucesso.

## Validação

O parecer, os comandos executados e as pendências estão no [relatório de validação](favoritos-pendencias.md). Foi confirmado um defeito de sincronização entre a listagem e o cache de IDs. Os cenários de sessão e respostas atrasadas ainda precisam de cobertura automatizada específica.

## Limites da entrega

Não inclui favoritos anônimos, listas múltiplas ou compartilhadas, alertas, e-mails, administração de favoritos nem botão adicional no bloco principal do detalhe do produto. Os cards de recomendações estão incluídos.

## Validação da implementação

- Backend: 13 testes de favoritos aprovados em ambiente temporário Python 3.12 com SQLite. Django system check, conferência de migrations, Ruff e formatação dos arquivos da feature passaram.
- Frontend: 9 testes focados de contexto, página e card aprovados; `npm run build` aprovado.
- Suíte completa do frontend: 94 testes aprovados e 2 falhas na execução registrada; o relatório detalha a comparação com a versão anterior.
- Suíte completa do backend: 384 testes aprovados, 8 falhas e 1 ignorado. As mesmas oito falhas foram reproduzidas antes da feature no ambiente de comparação.
- Lint frontend completo: 81 erros e 3 avisos, incluindo problemas anteriores e novos apontamentos nos testes e na configuração de rotas.
- A verificação visual com API simulada passou no fluxo básico, mas confirmou uma lista vazia incorreta quando os IDs locais estão desatualizados. A integração com API real e PostgreSQL permanece pendente.
