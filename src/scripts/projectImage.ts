export async function prepararZoom(section: HTMLElement, signal: AbortSignal) {
  const content = section.querySelector<HTMLElement>('[data-readme-content]');
  const dialog = section.querySelector<HTMLDialogElement>('[data-image-dialog]');
  const expanded = dialog?.querySelector<HTMLImageElement>('[data-expanded-image]');
  const viewport = dialog?.querySelector<HTMLElement>('[data-image-viewport]');
  const label = dialog?.querySelector<HTMLOutputElement>('output');
  if (!content || !dialog || !expanded || !viewport || !label) return;
  // Los distintivos de estado no cuentan como la primera captura del proyecto.
  let photo: HTMLImageElement | undefined;
  for (const image of content.querySelectorAll<HTMLImageElement>('img')) {
    if (/badge|shields\.io/i.test(image.src + ' ' + image.alt)) continue;
    try { await image.decode(); } catch { continue; }
    if (signal.aborted) return;
    if (image.naturalWidth >= 240 && image.naturalHeight >= 120) { photo = image; break; }
  }
  if (!photo || signal.aborted || !section.isConnected) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'readme-image-open';
  button.setAttribute('aria-label', 'Abrir y ampliar la imagen del proyecto');
  button.title = 'Abrir y ampliar';
  const parent = photo.parentElement;
  if (parent?.tagName === 'A' && parent.childElementCount === 1 && !parent.textContent?.trim()) parent.replaceWith(button);
  else photo.replaceWith(button);
  button.append(photo);
  let zoom = 1;
  let fitted = 0;
  const less = dialog.querySelector<HTMLButtonElement>('[data-zoom-out]')!;
  const more = dialog.querySelector<HTMLButtonElement>('[data-zoom-in]')!;
  const fit = () => { fitted = Math.min(viewport.clientWidth - 24, (viewport.clientHeight - 24) * photo!.naturalWidth / photo!.naturalHeight, photo!.naturalWidth); };
  const render = () => {
    expanded.style.width = Math.round(fitted * zoom) + 'px';
    label.textContent = Math.round(zoom * 100) + '%';
    less.disabled = zoom <= 1;
    more.disabled = zoom >= 4;
  };
  const change = (step: number) => { zoom = Math.min(4, Math.max(1, zoom + step)); render(); };
  button.addEventListener('click', () => {
    expanded.src = photo!.currentSrc || photo!.src;
    expanded.alt = photo!.alt;
    zoom = 1;
    dialog.showModal();
    fit(); render(); viewport.scrollTo(0, 0);
  }, { signal });
  less.addEventListener('click', () => change(-.5), { signal });
  more.addEventListener('click', () => change(.5), { signal });
  dialog.querySelector('[data-image-fit]')?.addEventListener('click', () => { zoom = 1; fit(); render(); viewport.scrollTo(0, 0); }, { signal });
  dialog.querySelector('[data-image-close]')?.addEventListener('click', () => dialog.close(), { signal });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }, { signal });
  dialog.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); change(.5); }
    if (event.key === '-') { event.preventDefault(); change(-.5); }
  }, { signal });
  dialog.addEventListener('close', () => button.focus(), { signal });
  window.addEventListener('resize', () => { if (dialog.open) { fit(); render(); } }, { signal });
  signal.addEventListener('abort', () => { if (dialog.open) dialog.close(); }, { once: true });
}
