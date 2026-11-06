import test from 'node:test';
import assert from 'node:assert/strict';

test('restaura los paneles de actividad antes del intercambio y entre proyectos', async (t) => {
  const listeners = new Map();
  let current;
  let codex;
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else delete globalThis.document;
  });
  Object.defineProperty(globalThis, 'document', { value: {
    addEventListener: (name, listener) => listeners.set(name, listener),
    querySelector: (selector) => selector === '[data-wakatime]' ? current : codex,
  }, configurable: true });
  await import('../src/scripts/activity.ts');
  const swap = listeners.get('astro:before-swap');
  const panel = { height: 2400, content: 'actividad cargada', cloneNode() { return { ...this }; } };
  current = panel;
  codex = { ...panel, height: 900 };
  swap({ newDocument: { querySelector: () => null } });
  current = null;
  codex = null;
  // Visitar otro proyecto no debe borrar la sección guardada de la portada.
  swap({ newDocument: { querySelector: () => null } });
  let restored;
  const restoredPanels = new Map();
  swap({ newDocument: { querySelector: () => ({ replaceWith: (node) => { restored = node; } }) } });
  swap({ newDocument: { querySelector: (selector) => ({ replaceWith: (node) => restoredPanels.set(selector, node) }) } });
  assert.equal(restoredPanels.get('[data-codex]').height, 900);
  assert.equal(restoredPanels.get('[data-wakatime]').height, 2400);
  assert.equal(restored.height, 2400);
  assert.equal(restored.content, 'actividad cargada');
  assert.notEqual(restored, panel);
  current = { ...panel, height: 2500 };
  swap({ newDocument: { querySelector: () => null } });
  current = null;
  codex = null;
  swap({ newDocument: { querySelector: () => ({ replaceWith: (node) => { restored = node; } }) } });
  assert.equal(restored.height, 2500);
});