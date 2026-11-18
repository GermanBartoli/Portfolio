const pulsar = document.querySelector<HTMLButtonElement>('#pulsar');
const tempo = document.querySelector('#tempo');
let pulsos: number[] = [];
pulsar?.addEventListener('click', () => {
  const ahora = performance.now();
  if (ahora - (pulsos.at(-1) ?? ahora) > 3000) pulsos = [];
  pulsos.push(ahora);
  pulsos = pulsos.slice(-8);
  if (tempo) tempo.textContent = pulsos.length < 2 ? 'Tocá otra vez.' :
    Math.round(60000 * (pulsos.length - 1) / Math.max(1, ahora - pulsos[0])) + ' pulsos por minuto';
});
const sorpresa = document.querySelector<HTMLButtonElement>('#sorpresa');
let anterior = '';
sorpresa?.addEventListener('click', () => {
  const opciones = Array.from(document.querySelectorAll<HTMLAnchorElement>('nav a:not([aria-current])')).filter(a => a.href !== anterior);
  const elegida = opciones[Math.floor(Math.random() * opciones.length)];
  const destino = document.querySelector<HTMLAnchorElement>('#destino');
  if (!destino || !elegida) return;
  anterior = elegida.href;
  destino.href = elegida.href;
  destino.textContent = 'Abrir ' + elegida.textContent + ' ↗';
});
