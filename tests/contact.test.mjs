import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../public/_worker.js';

function request(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return new Request('https://marco.example/api/contact', {
    method: 'POST',
    body: form,
  });
}

const valid = {
  nombre: 'Ana',
  email: 'ana@example.com',
  servicio: 'Una colaboración',
  mensaje: 'Quiero entrenar con una rutina clara.',
};

test('rechaza solicitudes de otro origen', async () => {
  const req = request(valid);
  req.headers.set('Origin', 'https://otro.example');
  assert.equal(
    (await onRequestPost({ request: req, env: environment() })).status,
    403,
  );
});

test('rechaza cuerpos grandes aunque no indiquen Content-Length', async () => {
  const response = await onRequestPost({
    request: new Request('https://marco.example/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ ...valid, mensaje: 'x'.repeat(13000) }),
    }),
    env: environment(),
  });
  assert.equal(response.status, 413);
});

test('el campo trampa detiene el envío sin contactar al proveedor', async (context) => {
  context.mock.method(globalThis, 'fetch', () => {
    throw new Error('No debe enviar');
  });
  const response = await onRequestPost({
    request: request({ ...valid, website: 'spam' }),
    env: environment(),
  });
  assert.equal(response.status, 200);
});

test('una respuesta ambigua del proveedor no confirma el envío', async (context) => {
  context.mock.method(
    globalThis,
    'fetch',
    async () => new Response(JSON.stringify({ message: 'pending' })),
  );
  const response = await onRequestPost({
    request: request(valid),
    env: environment(),
  });
  assert.equal(response.status, 502);
});

function environment(store = new Map()) {
  return {
    CONTACT_RECIPIENT: 'destino@example.com',
    CONTACT_LIMITS: {
      get: async (key) => store.get(key) || null,
      put: async (key, value) => store.set(key, value),
    },
  };
}

test('rechaza envíos sin configurar destinatario', async () => {
  const response = await onRequestPost({ request: request(valid), env: {} });
  assert.equal(response.status, 503);
});

test('valida datos antes de enviar', async () => {
  const response = await onRequestPost({
    request: request({ ...valid, email: 'incorrecto' }),
    env: environment(),
  });
  assert.equal(response.status, 400);
});

test('envía al destinatario configurado en el servidor', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  let url;
  let body;
  let headers;
  globalThis.fetch = async (destination, options) => {
    url = destination;
    body = new URLSearchParams(options.body);
    headers = options.headers;
    return new Response(JSON.stringify({ success: 'true' }), { status: 200 });
  };

  const response = await onRequestPost({
    request: request(valid),
    env: environment(),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(url, 'https://formsubmit.co/ajax/destino%40example.com');
  assert.equal(body.get('email'), valid.email);
  assert.equal(body.get('message'), valid.mensaje);
  assert.equal(headers.Origin, 'https://marco.example');
  assert.equal(headers.Referer, 'https://marco.example/');
});

test('avisa cuando el buzón todavía requiere activación', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: 'false',
        message: 'This form needs Activation.',
      }),
      { status: 200 },
    );

  const response = await onRequestPost({
    request: request(valid),
    env: environment(),
  });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /Falta activar/);
});

test('avisa cuando el proveedor limita temporalmente los envíos', async (context) => {
  context.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(
        JSON.stringify({ success: 'false', message: 'Rate limit exceeded.' }),
        { status: 429 },
      ),
  );
  const response = await onRequestPost({
    request: request(valid),
    env: environment(),
  });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /limitando los envíos/);
});

test('no confirma el envío si el proveedor lo rechaza', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: false }), { status: 200 });

  const response = await onRequestPost({
    request: request(valid),
    env: environment(),
  });
  assert.equal(response.status, 502);
  assert.equal((await response.json()).ok, false);
});

test('limita a dos envíos por IP durante un minuto', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: 'true' }), { status: 200 });

  const env = environment();
  assert.equal(
    (await onRequestPost({ request: request(valid), env })).status,
    200,
  );
  assert.equal(
    (await onRequestPost({ request: request(valid), env })).status,
    200,
  );
  const limited = await onRequestPost({ request: request(valid), env });
  assert.equal(limited.status, 429);
  assert.match((await limited.json()).error, /Esperá un minuto/);
});
