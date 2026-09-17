## O9: Promessas comerciais sem suporte no backend
**Trio:** Ian, Arthur e Danilo

**Por que a melhoria foi relevante?**
Seis promessas da UI não tinham suporte real no backend (levantado na [issue #18](https://github.com/Shio-Enterprise/Documentacao/issues/18), decisão do cliente na [issue #19](https://github.com/Shio-Enterprise/Documentacao/issues/19#issuecomment-5618776911)). Implementamos o desconto automático de boas-vindas (10% na primeira compra), a newsletter real com consentimento LGPD, corrigimos os selos de pagamento para refletir o gateway real (InfinitePay: Pix, Cartão, Boleto) e removemos promessas falsas: links de termos/privacidade quebrados, estrelas de avaliação fixas (mockadas) e a promessa de e-mail de confirmação que nunca era enviado.

**Evidências (Pull Requests):**
- [Frontend PR #4](https://github.com/Shio-Enterprise/frontend/pull/4)
- [Backend PR #3](https://github.com/Shio-Enterprise/backend/pull/3)

**Evidências (prints):**

Banner de boas-vindas atualizado para 10%:

![Banner 10% de desconto](../../../assets/evidencias-o9/01-banner-10.jpg)

Rodapé: newsletter com consentimento LGPD e selos Pix/Cartão/Boleto:

![Newsletter e selos de pagamento](../../../assets/evidencias-o9/02-footer-newsletter-badges.jpg)

Login sem links quebrados de termos/privacidade (texto simples, sem `<Link>`):

![Login sem links de termos](../../../assets/evidencias-o9/03-login-sem-links.jpg)

Carrinho aplicando o desconto de boas-vindas automaticamente (sem campo de cupom manual):

![Carrinho com desconto automático](../../../assets/evidencias-o9/04-carrinho-desconto.jpg)

Card de produto sem estrelas de avaliação fixas:

![Card sem estrela](../../../assets/evidencias-o9/05-card-sem-estrela.jpg)