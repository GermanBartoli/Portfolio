import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararReadme } from '../public/readmes.mjs';
const source = { html_url: 'https://github.com/autor/repo/blob/gh-pages/docs/README.md', download_url: 'https://raw.githubusercontent.com/autor/repo/gh-pages/docs/README.md' };
test('resuelve imágenes y enlaces desde la rama y carpeta reales', () => {
  const html = prepararReadme('<img src="../imagen.png"><a href="uso.md">Uso</a><a href="https://example.com">Web</a>', source);
  assert.match(html, /src="https:\/\/raw.githubusercontent.com\/autor\/repo\/gh-pages\/imagen.png"/);
  assert.match(html, /href="https:\/\/github.com\/autor\/repo\/blob\/gh-pages\/docs\/uso.md"/);
  assert.match(html, /href="https:\/\/example.com"/);
});
test('mantiene los índices internos de GitHub y retira marcos incrustados', () => {
  const html = prepararReadme('<a href="#instalación">Ir</a><a id="user-content-instalación" href="#user-content-instalación">Título</a><iframe src="https://example.com"></iframe>', source);
  assert.equal((html.match(/href="#user-content-instalación"/g) || []).length, 2);
  assert.ok(!html.includes('iframe'));
});

test('los diagramas no quedan con un indicador de carga permanente', () => {
  const html = prepararReadme('<section data-type="mermaid"><pre>graph TD; A--&gt;B</pre><span>Loading</span></section>', source);
  assert.match(html, /Ver diagrama en GitHub/);
  assert.match(html, /graph TD/);
  assert.ok(!html.includes("Loading"));
});

import { getProjectReadme } from '../public/readmes.mjs';
import worker from '../public/_worker.js';
const request = (method = 'GET', slug = 'obs-recording-beep') => new Request('https://portfolio.example/api/readme/' + slug, { method });
test('solo admite lectura de los proyectos del portfolio', async t => {
  t.mock.method(globalThis, 'fetch', () => { throw Error('No debe consultar'); });
  assert.equal((await getProjectReadme(request('POST'))).status, 405);
  assert.equal((await getProjectReadme(request('GET', 'otro-repo'))).status, 404);
});
test('consulta GitHub sin secretos y conserva enlaces e imágenes', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.github.com/repos/GermanBartoli/obs-recording-beep/readme');
    assert.ok(!options.headers.Authorization);
    return ++calls === 1 ? Response.json(source) : new Response('<img src="imagen.png"><h2>Uso actual</h2>');
  });
  const response = await getProjectReadme(request());
  assert.equal(response.status, 200);
  assert.match((await response.json()).html, /raw.githubusercontent.com/);
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=300');
});
test('distingue README ausente de límites temporales de GitHub', async t => {
  for (const [upstream, expected] of [[404,404],[403,503],[429,503],[500,503]]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: upstream }));
    assert.equal((await getProjectReadme(request())).status, expected);
    mock.mock.restore();
  }
});
test('rechaza documentos de tamaño excesivo', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('x'.repeat(2000001)));
  assert.equal((await getProjectReadme(request())).status, 503);
});
test('reutiliza la caché sin consultar GitHub', async t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'caches');
  Object.defineProperty(globalThis, 'caches', { configurable: true, value: { default: { match: async () => Response.json({ html: 'guardado' }) } } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, 'caches', previous); else delete globalThis.caches; });
  t.mock.method(globalThis, 'fetch', () => { throw Error('No debe consultar'); });
  assert.equal((await (await getProjectReadme(request())).json()).html, 'guardado');
});
test('habilita GitHub Pages sin permitir otros orígenes', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  for (const origin of ['https://germanbartoli.github.io','https://otro.example']) {
    const r = new Request(request(), { headers: { Origin: origin } });
    const response = await worker.fetch(r, {});
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin === 'https://germanbartoli.github.io' ? origin : null);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
});

import { extraerReadmePublico } from '../public/readmes.mjs';
test('recupera el HTML de la página pública cuando la API limita consultas', async t => {
  const urls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    urls.push(url);
    return String(url).includes('api.github.com') ? new Response('', {status:403}) : new Response('<article class="markdown-body entry-content"><h1>Guía actual</h1><img src="/autor/repo/raw/otra-rama/docs/vista.png"><a href="#uso">Uso</a></article>');
  });
  const response = await getProjectReadme(request());
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.match(data.html, /https:\/\/github.com\/autor\/repo\/raw\/otra-rama\/docs\/vista.png/);
  assert.match(data.html, /#user-content-uso/);
  assert.equal(urls[1], 'https://github.com/GermanBartoli/obs-recording-beep');
});
test('no confunde una página de login o error con documentación', () => {
  assert.throws(() => extraerReadmePublico('<html>Iniciar sesión</html>', 'https://github.com/autor/repo'));
});
