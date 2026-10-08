## Unificar autenticação e acesso ao painel administrativo
**Trio:** Amanda, Felipe e Cauã

**Origem:**
- [Issue #41](https://github.com/Shio-Enterprise/Documentacao/issues/41) — unificar autenticação e acesso ao painel administrativo.

**Por que a melhoria foi relevante?**
O painel administrativo utilizava um fluxo de autenticação separado da loja, o que obrigava administradores a lidar com uma rota própria de login e mantinha duas experiências de sessão para a mesma aplicação. A entrega centraliza a autenticação em uma única tela, reutiliza a mesma sessão para clientes e administradores e deixa a autorização administrativa como uma responsabilidade separada da autenticação.

**Regras implementadas:**
- A rota `/login` passou a ser o único ponto de autenticação para clientes e administradores; o fluxo de `/admin/login` foi removido.
- O backend continua sendo a fonte da identificação administrativa da conta e a sessão autenticada é compartilhada entre loja e painel.
- O acesso ao painel é exibido na navegação apenas para contas administrativas.
- Rotas administrativas são protegidas no frontend e usuários sem autenticação são redirecionados para o login preservando a rota que tentavam acessar.
- Usuários autenticados sem privilégio administrativo não conseguem acessar diretamente as páginas do painel.
- A navegação do painel foi centralizada nas funcionalidades administrativas existentes, com identificação da conta autenticada, retorno para a loja e uma única ação de logout.
- O logout utiliza o mesmo `AuthContext` da aplicação e limpa imediatamente o estado do usuário e das permissões, evitando que ações administrativas permaneçam visíveis após encerrar a sessão.
- A auditoria de segurança dos endpoints administrativos corrigiu o inventário legado, que passou a exigir autorização administrativa assim como as demais operações do painel.

**Validação automatizada:**
- Testes de login de cliente e administrador pela mesma API de autenticação.
- Testes de redirecionamento de usuário não autenticado e bloqueio de usuário comum nas rotas administrativas.
- Testes de exibição e ocultação do acesso ao painel conforme o perfil autenticado.
- Testes de navegação entre loja e painel mantendo a mesma sessão e de logout compartilhado.
- Testes de autorização dos principais endpoints administrativos, cobrindo respostas `401`, `403` e acesso autorizado.

**Evidências (Pull Requests):**

- [Frontend PR #20](https://github.com/Shio-Enterprise/frontend/pull/20)
- [Backend PR #21](https://github.com/Shio-Enterprise/backend/pull/21)

**Evidências (prints):**

Após a autenticação, contas com privilégios administrativos passam a visualizar uma opção de acesso ao painel diretamente pela interface principal da aplicação. Usuários comuns não possuem esse acesso, mantendo a separação das funcionalidades conforme o perfil autenticado:

![Acesso ao Painel Administrativo](../../../assets/evidencias-permissoes-admin/acesso-painel-admin.png)
