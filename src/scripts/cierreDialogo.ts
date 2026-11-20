export function prepararCierreDialogo(dialogo: HTMLDialogElement, signal: AbortSignal) {
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    dialogo.querySelector('button[command="close"]')?.addEventListener('click', () => dialogo.close(), { signal });
  }
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialogo.addEventListener('click', evento => {
      if (evento.target !== dialogo) return;
      const limites = dialogo.getBoundingClientRect();
      if (evento.clientX < limites.left || evento.clientX > limites.right ||
          evento.clientY < limites.top || evento.clientY > limites.bottom) {
        dialogo.close();
      }
    }, { signal });
  }
}
