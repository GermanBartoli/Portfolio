import { prepararZoom } from './projectImage';
let active: AbortController | undefined;
const observadorTablas = new ResizeObserver(entradas => {
  for (const { target } of entradas) {
    const contenedor = target.closest<HTMLElement>('.tabla-desplazable');
    if (!contenedor) continue;
    if (contenedor.scrollWidth > contenedor.clientWidth + 1) {
      contenedor.tabIndex = 0;
      contenedor.setAttribute('role', 'region');
      contenedor.setAttribute('aria-label', contenedor.dataset.nombre!);
    } else {
      contenedor.removeAttribute('tabindex');
      contenedor.removeAttribute('role');
      contenedor.removeAttribute('aria-label');
    }
  }
});

function prepararTablas(raiz: ParentNode) {
  for (const tabla of raiz.querySelectorAll<HTMLTableElement>('.readme-content table')) {
    if (tabla.parentElement?.classList.contains('tabla-desplazable')) continue;
    const contenedor = document.createElement('div');
    contenedor.className = 'tabla-desplazable';
    const columnas = Array.from(tabla.tHead?.rows[0]?.cells ?? [], celda => celda.textContent?.trim()).filter(Boolean);
    contenedor.dataset.nombre = tabla.caption?.textContent?.trim() || (columnas.length ? 'Tabla con columnas ' + columnas.join(', ') : 'Tabla de la guía');
    tabla.before(contenedor);
    contenedor.append(tabla);
    observadorTablas.observe(contenedor);
    observadorTablas.observe(tabla);
  }
}
async function cargarReadme() {
  active?.abort();
  const section = document.querySelector<HTMLElement>('[data-project-readme]');
  if (!section) return;
  const content = section.querySelector<HTMLElement>('[data-readme-content]')!;
  const status = section.querySelector<HTMLElement>('[data-readme-status]')!;
  const retry = section.querySelector<HTMLButtonElement>('[data-readme-retry]')!;
  const controller = new AbortController();
  active = controller;
  const reintento = !retry.hidden && document.activeElement === retry;
  retry.setAttribute('aria-disabled', 'true');
  retry.onclick = () => {
    if (section.getAttribute('aria-busy') !== 'true') void cargarReadme();
  };
  status.textContent = 'Cargando documentación desde GitHub…';
  section.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/api/readme/' + encodeURIComponent(section.dataset.projectReadme!), { signal: controller.signal });
    const data = await response.json();
    if (!response.ok) {
      status.textContent = response.status === 404 ? 'Este proyecto no tiene un README público disponible.' : 'No pudimos consultar GitHub. Podés reintentar o abrir el README original.';
      if (response.status === 404 && reintento && document.activeElement === retry) status.focus({ preventScroll: true });
      retry.hidden = response.status === 404;
      return;
    }
    if (typeof data.html !== 'string') throw new Error('Documento inválido');
    const template = document.createElement('template');
    template.innerHTML = data.html;
    // Defensa adicional sobre el HTML que GitHub ya entrega sanitizado.
    template.content.querySelectorAll('script,style,iframe,object,embed,form,input,button,link,meta,base').forEach(node => node.remove());
    template.content.querySelectorAll('*').forEach(node => {
      for (const attribute of [...node.attributes]) {
        if (/^on/i.test(attribute.name) || ['srcdoc', 'srcset', 'style'].includes(attribute.name)) node.removeAttribute(attribute.name);
        if (['href', 'src', 'xlink:href'].includes(attribute.name) && !/^(https?:\/\/|#|mailto:)/i.test(attribute.value)) node.removeAttribute(attribute.name);
      }
    });
    if (controller.signal.aborted || !section.isConnected) return;
    content.replaceChildren(template.content);
    content.hidden = false;
    prepararTablas(section);
    void prepararZoom(section, controller.signal);
    status.textContent = 'README de GitHub · Se actualiza automáticamente (caché de 5 minutos).';
    if (reintento && document.activeElement === retry) status.focus({ preventScroll: true });
    retry.hidden = true;
    const anchor = decodeURIComponent(location.hash.slice(1));
    if (anchor.startsWith('user-content-')) document.getElementById(anchor)?.scrollIntoView();
  } catch {
    if (controller.signal.aborted) return;
    status.textContent = 'No pudimos cargar la documentación. Podés reintentar o verla en GitHub.';
    retry.hidden = false;
  } finally {
    if (!controller.signal.aborted) {
      section.removeAttribute('aria-busy');
      retry.removeAttribute('aria-disabled');
    }
  }
}
document.addEventListener('astro:page-load', () => {
  observadorTablas.disconnect();
  prepararTablas(document);
  void cargarReadme();
});
document.addEventListener('astro:before-swap', () => {
  active?.abort();
  observadorTablas.disconnect();
});
