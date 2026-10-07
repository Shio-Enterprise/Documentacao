// Capturas reais de localhost. Execute após migrate e scripts/seed_wishlist_e2e.py.
// Requer Playwright e Chrome; não substitui a API por respostas simuladas.
const { chromium, request } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const site = process.env.WISHLIST_SITE || 'http://127.0.0.1:5137';
const api = process.env.WISHLIST_API || 'http://127.0.0.1:8037/api';
const output = path.resolve(__dirname, '../docs/assets/evidencias-favoritos');
for (const url of [site, api]) {
  assert.ok(['localhost', '127.0.0.1'].includes(new URL(url).hostname), 'Use apenas localhost');
}
const productId = (index) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;

(async () => {
  await fs.mkdir(output, { recursive: true });
  const client = await request.newContext();
  const email = `favoritos-prints-${Date.now()}@example.test`;
  const password = 'Favoritos-Demonstracao-37!';
  const registration = await client.post(`${api}/auth/register/`, { data: { name: 'Cliente Demonstração', email, password } });
  assert.equal(registration.status(), 201, await registration.text());
  const { access } = await registration.json();
  const headers = { Authorization: `Bearer ${access}` };
  const addViaApi = async (index) => {
    const result = await client.post(`${api}/catalog/wishlist/`, { headers, data: { product: productId(index) } });
    assert.ok([200, 201].includes(result.status()), await result.text());
  };
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  const evidence = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const screenshot = async (filename, description) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(output, filename), animations: 'disabled' });
    evidence.push({ filename, description, route: new URL(page.url()).pathname, viewport: page.viewportSize() });
    console.log(`Capturado: ${filename}`);
  };
  const login = async () => {
    await page.getByPlaceholder('E-mail', { exact: true }).fill(email);
    await page.getByPlaceholder('Senha', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  };
  const openFavorites = async () => {
    await page.getByRole('link', { name: 'Minha conta', exact: true }).click();
    await page.getByRole('link', { name: 'Favoritos', exact: true }).last().click();
    await page.getByRole('heading', { name: 'Meus favoritos', exact: true }).waitFor();
    await page.getByText('Carregando favoritos...', { exact: true }).waitFor({ state: 'hidden' });
  };
  try {
    await page.goto(`${site}/category/all?search=Wishlist%20E2E&page=2`);
    await page.getByRole('button', { name: 'Adicionar Wishlist E2E 01 aos favoritos', exact: true }).waitFor();
    await screenshot('01-catalogo-visitante.png', 'Catálogo público com coração desmarcado.');
    await page.getByRole('button', { name: 'Adicionar Wishlist E2E 01 aos favoritos', exact: true }).click();
    await page.getByRole('button', { name: 'Entrar', exact: true }).waitFor();
    await screenshot('02-login-obrigatorio.png', 'Visitante encaminhado ao login ao tentar favoritar.');
    await login();
    await page.waitForURL((url) => url.pathname === '/category/all' && url.searchParams.get('search') === 'Wishlist E2E');
    for (const index of [1, 2]) {
      const name = `Wishlist E2E ${String(index).padStart(2, '0')}`;
      await page.getByRole('button', { name: `Adicionar ${name} aos favoritos`, exact: true }).click();
      await page.getByRole('button', { name: `Remover ${name} dos favoritos`, exact: true }).waitFor();
    }
    await page.goto(`${site}/category/all?search=Wishlist%20E2E&page=2`);
    await page.getByRole('button', { name: 'Remover Wishlist E2E 01 dos favoritos', exact: true }).waitFor();
    await screenshot('03-catalogo-coracoes-marcados.png', 'Produtos 01 e 02 favoritados após autenticação.');
    await addViaApi(14); // Visible but out of stock; cannot be added from the stock-filtered catalog.
    await openFavorites();
    await page.getByRole('button', { name: 'Remover Wishlist E2E 14 dos favoritos', exact: true }).waitFor();
    await page.getByText('Indisponível', { exact: true }).waitFor();
    await screenshot('04-minha-conta-desktop.png', 'Lista reconciliada com inclusão em outra sessão e produto sem estoque.');
    await page.setViewportSize({ width: 390, height: 920 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await screenshot('05-minha-conta-mobile.png', 'Navegação mobile e favorito indisponível, sem overflow horizontal.');
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.reload();
    await page.getByRole('button', { name: 'Remover Wishlist E2E 14 dos favoritos', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Sair', exact: true }).last().click();
    await page.waitForURL((url) => url.pathname === '/');
    assert.equal(await page.evaluate(() => localStorage.getItem('accessToken')), null);
    await page.getByRole('link', { name: 'Minha conta', exact: true }).click();
    await login();
    await page.getByRole('link', { name: 'Favoritos', exact: true }).last().click();
    await page.getByRole('button', { name: 'Remover Wishlist E2E 14 dos favoritos', exact: true }).waitFor();
    await screenshot('06-persistencia-apos-login.png', 'Favoritos preservados depois de recarregar, sair e entrar novamente.');

    for (let index = 3; index <= 12; index += 1) await addViaApi(index);
    await page.reload();
    await page.getByRole('button', { name: 'Próxima', exact: true }).click();
    await page.getByRole('button', { name: 'Remover Wishlist E2E 01 dos favoritos', exact: true }).waitFor();
    await page.getByText('Página 2', { exact: true }).waitFor();
    await page.evaluate(() => scrollTo(0, 0));
    await screenshot('07-paginacao.png', 'Treze favoritos: segundo conjunto contém o item mais antigo.');
    await page.getByRole('button', { name: 'Remover Wishlist E2E 01 dos favoritos', exact: true }).click();
    await page.getByText('Página 2', { exact: true }).waitFor({ state: 'hidden' });
    await page.getByText('12 itens', { exact: true }).waitFor();

    // Interrupt only the list network request; no successful API response is forged.
    const listRoute = /\/api\/catalog\/wishlist\/\?/;
    await page.route(listRoute, (route) => route.abort('failed'));
    await page.reload();
    await page.getByRole('alert').filter({ hasText: 'Não foi possível carregar seus favoritos.' }).waitFor();
    await screenshot('08-erro-e-nova-tentativa.png', 'Falha de rede controlada na listagem com opção de tentar novamente.');
    await page.unroute(listRoute);
    await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await page.getByRole('button', { name: 'Remover Wishlist E2E 12 dos favoritos', exact: true }).waitFor();
    for (let remaining = 12; remaining > 0; remaining -= 1) {
      const button = page.getByRole('button', { name: /^Remover Wishlist E2E .* dos favoritos$/ }).first();
      await button.click();
      await page.getByText(`${remaining - 1} ${remaining - 1 === 1 ? 'item' : 'itens'}`, { exact: true }).waitFor();
    }
    await page.getByRole('heading', { name: 'Você ainda não tem favoritos', exact: true }).waitFor();
    await page.evaluate(() => scrollTo(0, 0));
    await screenshot('09-lista-vazia.png', 'Lista vazia após remoções pela interface, com retorno ao catálogo.');
    assert.deepEqual(errors, []);
    await fs.writeFile(path.join(output, 'capturas.json'), JSON.stringify({ date: '2026-10-07', backend: 'ff3149f', frontend: 'f883938', api: 'Django real + PostgreSQL 15 local', fixtures: 'scripts/seed_wishlist_e2e.py; conta de demonstração exclusiva', controlledFailure: 'Somente captura 08: requisição da listagem interrompida no navegador', evidence }, null, 2) + '\n');
    console.log('Concluído: 9 prints, API real, persistência e remoção verificadas.');
  } catch (error) {
    await page.screenshot({ path: '/tmp/favoritos-captura-falha.png', fullPage: true });
    console.error('Falha na rota:', page.url());
    throw error;
  } finally {
    await browser.close();
    await client.dispose();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
