import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../public/_worker.js';

test('GitHub Pages puede leer estadísticas y otros orígenes no reciben permiso CORS', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Sin conexión en la prueba'); });
  for (const origin of ['https://germanbartoli.github.io', 'https://otro.example']) {
    const response = await worker.fetch(new Request('https://portfolio.example/api/activity/wakatime', { headers: { Origin: origin } }), {});
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin === 'https://germanbartoli.github.io' ? origin : null);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});
