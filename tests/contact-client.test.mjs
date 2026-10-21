import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/scripts/contact.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

function client(response) {
  const status = { textContent: '' };
  const button = { disabled: false };
  let submit;
  let reset = false;
  let target;
  const form = {
    dataset: {}, action: 'https://formsubmit.co/identificador-publico',
    querySelector: () => button,
    addEventListener: (_, handler) => { submit = handler; },
    reset: () => { reset = true; },
  };
  vm.runInNewContext(source, {
    document: { addEventListener: (_, handler) => handler(), querySelector: () => form, getElementById: () => status },
    FormData: class {}, AbortSignal, Error,
    fetch: async (url) => { target = url; if (response instanceof Error) throw response; return { ok: true, json: async () => response }; },
  });
  return { send: () => submit({ preventDefault() {} }), status, button, target: () => target, reset: () => reset };
}

test('el formulario público envía al identificador anónimo y confirma éxito', async () => {
  const app = client({ success: 'true' }); await app.send();
  assert.equal(app.target(), 'https://formsubmit.co/ajax/identificador-publico');
  assert.match(app.status.textContent, /Mensaje enviado/);
  assert.equal(app.reset(), true); assert.equal(app.button.disabled, false);
});

test('una respuesta ambigua no borra el mensaje ni anuncia éxito', async () => {
  const app = client({ message: 'pending' }); await app.send();
  assert.match(app.status.textContent, /No se pudo enviar/);
  assert.equal(app.reset(), false); assert.equal(app.button.disabled, false);
});

test('la activación pendiente se distingue de un envío exitoso', async () => {
  const app = client({ success: 'false', message: 'This form needs Activation' }); await app.send();
  assert.match(app.status.textContent, /necesita activación/);
  assert.equal(app.reset(), false);
});

test('un fallo de conexión conserva los datos y rehabilita el botón', async () => {
  const app = client(new Error('Sin conexión')); await app.send();
  assert.equal(app.status.textContent, 'Sin conexión');
  assert.equal(app.reset(), false); assert.equal(app.button.disabled, false);
});
