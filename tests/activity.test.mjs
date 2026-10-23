import test from 'node:test';
import assert from 'node:assert/strict';
import { getWakaActivity } from '../public/_worker.js';

const request = () => new Request('https://portfolio.example/api/activity/wakatime');
test('publica solo estadísticas visibles y elimina datos privados de WakaTime', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => new Response(JSON.stringify({ data: url.endsWith('/stats/all_time') ? {
    status: 'ok', is_coding_activity_visible: true, total_seconds: 7200, daily_average: 3600,
    is_language_usage_visible: true, languages: [{ name: 'TypeScript', percent: 100, total_seconds: 7200, secret: 'privado' }],
    is_editor_usage_visible: false, editors: [{ name: 'Editor privado', percent: 100 }],
    projects: ['Proyecto privado'], email: 'privado@example.test',
  } : { days: [{ date: '2026-10-21', total: 3600, project: 'privado' }] } })));
  const response = await getWakaActivity(request());
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.total, 7200);
  assert.equal(data.groups[0].items[0].name, 'TypeScript');
  assert.deepEqual(data.groups[1].items, []);
  assert.deepEqual(data.days, [{ date: '2026-10-21', total: 3600 }]);
  assert.doesNotMatch(JSON.stringify(data), /privado|secret|email|projects/);
});
test('no devuelve estadísticas si la actividad deja de ser pública', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ data: { status: 'ok', is_coding_activity_visible: false, days: [] } })));
  assert.equal((await getWakaActivity(request())).status, 503);
});
test('maneja fallos del proveedor sin filtrar su respuesta', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('información interna', { status: 429 }));
  const response = await getWakaActivity(request());
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /interna/);
});
test('el endpoint de actividad solo admite lectura', async () => {
  assert.equal((await getWakaActivity(new Request(request(), { method: 'POST' }))).status, 405);
});
