# Evidências

Colocar evidências do que foi feito, podendo ser prints de tela, código...

## Login Tradicional e Segurança de Auth
**Trio:** Ian, Arthur, Danilo

**Por que a melhoria foi relevante?** 
Implementamos a autenticação tradicional (E-mail e Senha) para acabar com a dependência exclusiva de contas do Google. Isso democratizou o acesso à plataforma para usuários corporativos e outros provedores. Ao mesmo tempo, corrigimos brechas críticas de segurança: fechamos o roteamento administrativo que estava exposto, implementamos o encerramento real da sessão via backend (Logout API) e arrumamos o sistema de privilégios (`is_staff`).

**Evidências (Pull Requests):**
- [Frontend PR #2](https://github.com/Shio-Enterprise/frontend/pull/2)
- [Backend PR #2](https://github.com/Shio-Enterprise/backend/pull/2)