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
  };
  photos.forEach((button, index) => button.addEventListener('click', () => { trigger = button; show(index); }, { signal }));
  dialog?.querySelector('[data-close-photo]')?.addEventListener('click', () => dialog.close(), { signal });
  dialog?.querySelectorAll<HTMLButtonElement>('[data-photo-step]').forEach(button => button.addEventListener('click', () => show(current + Number(button.dataset.photoStep)), { signal }));
  dialog?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(current + (event.key === 'ArrowLeft' ? -1 : 1)); }
  }, { signal });
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }, { signal });
  dialog?.addEventListener('close', () => trigger?.focus(), { signal });
  cleanup = () => controller.abort();
}
document.addEventListener('astro:page-load', setupGallery);
document.addEventListener('astro:before-swap', () => cleanup?.());
