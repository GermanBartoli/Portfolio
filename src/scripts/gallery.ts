export {};
let cleanup: (() => void) | undefined;
function setupGallery() {
  cleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  const dialog = document.querySelector<HTMLDialogElement>('#photo-dialog');
  const image = document.querySelector<HTMLImageElement>('#photo-expanded');
  const caption = document.querySelector('#photo-caption');
  const photos = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-photo]'));
  const viewport = dialog?.querySelector<HTMLElement>('.photo-viewport');
  const label = dialog?.querySelector<HTMLOutputElement>('[data-photo-zoom-label]');
  const less = dialog?.querySelector<HTMLButtonElement>('[data-photo-zoom-out]');
  const more = dialog?.querySelector<HTMLButtonElement>('[data-photo-zoom-in]');
  let zoom = 1;
  const render = () => {
    if (!image || !viewport || !label || !less || !more) return;
    if (image.complete && image.naturalWidth) {
      const fitted = Math.min(viewport.clientWidth - 24, (viewport.clientHeight - 24) * image.naturalWidth / image.naturalHeight, image.naturalWidth);
      image.style.width = Math.round(fitted * zoom) + 'px';
    }
    label.textContent = Math.round(zoom * 100) + '%';
    less.disabled = zoom <= 1;
    more.disabled = zoom >= 4;
  };
  const change = (step: number) => { zoom = Math.min(4, Math.max(1, zoom + step)); render(); };
  const reset = () => { zoom = 1; render(); viewport?.scrollTo(0, 0); };
  image?.addEventListener('load', render, { signal });
  less?.addEventListener('click', () => change(-.5), { signal });
  more?.addEventListener('click', () => change(.5), { signal });
  dialog?.querySelector('[data-photo-fit]')?.addEventListener('click', reset, { signal });
  window.addEventListener('resize', () => { if (dialog?.open) render(); }, { signal });
  let current = 0;
  let trigger: HTMLButtonElement | undefined;
  const show = (index: number) => {
    if (!dialog || !image || !caption || !photos.length) return;
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    image.src = photo.dataset.photo || '';
    image.alt = photo.dataset.caption || '';
    caption.textContent = `${current + 1} / ${photos.length} · ${image.alt}`;
    if (!dialog.open) dialog.showModal();
    reset();
  };
  photos.forEach((button, index) => button.addEventListener('click', () => { trigger = button; show(index); }, { signal }));
  dialog?.querySelector('[data-close-photo]')?.addEventListener('click', () => dialog.close(), { signal });
  dialog?.querySelectorAll<HTMLButtonElement>('[data-photo-step]').forEach(button => button.addEventListener('click', () => show(current + Number(button.dataset.photoStep)), { signal }));
  dialog?.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); change(.5); }
    if (event.key === '-') { event.preventDefault(); change(-.5); }
    if (zoom === 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); show(current + (event.key === 'ArrowLeft' ? -1 : 1)); }
  }, { signal });
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }, { signal });
  dialog?.addEventListener('close', () => trigger?.focus(), { signal });
  cleanup = () => { controller.abort(); if (dialog?.open) dialog.close(); };
}
document.addEventListener('astro:page-load', setupGallery);
document.addEventListener('astro:before-swap', () => cleanup?.());
