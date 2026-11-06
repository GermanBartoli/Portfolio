import test from 'node:test';
import assert from 'node:assert/strict';

test('restaura WakaTime antes del intercambio y conserva su altura entre proyectos', async (t) => {
  const listeners = new Map();
  let current;
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else delete globalThis.document;
  });
  Object.defineProperty(globalThis, 'document', { value: {
    addEventListener: (name, listener) => listeners.set(name, listener),
    querySelector: () => current,
  }, configurable: true });
  await import('../src/scripts/activity.ts');
  const swap = listeners.get('astro:before-swap');
  const panel = { height: 2400, content: 'actividad cargada', cloneNode() { return { ...this }; } };
  current = panel;
  swap({ newDocument: { querySelector: () => null } });
  current = null;
  // Visitar otro proyecto no debe borrar la sección guardada de la portada.
  swap({ newDocument: { querySelector: () => null } });
  let restored;
  swap({ newDocument: { querySelector: () => ({ replaceWith: (node) => { restored = node; } }) } });
  assert.equal(restored.height, 2400);
  assert.equal(restored.content, 'actividad cargada');
  assert.notEqual(restored, panel);
  current = { ...panel, height: 2500 };
  swap({ newDocument: { querySelector: () => null } });
  current = null;
  swap({ newDocument: { querySelector: () => ({ replaceWith: (node) => { restored = node; } }) } });
  assert.equal(restored.height, 2500);
});