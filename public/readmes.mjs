// GitHub entrega HTML sanitizado. Las rutas relativas conservan el repositorio de origen.
export function prepararReadme(html, source) {
  const pagina = new URL('.', source.html_url).href;
  const archivos = new URL('.', source.download_url).href;
  return html
    .replace(/<section\b[^>]*data-type="mermaid"[^>]*>[\s\S]*?<\/section>/gi, section => {
      const codigo = section.match(/<pre\b[^>]*>[\s\S]*?<\/pre>/i)?.[0] || "";
      return `<details><summary>Ver código del diagrama</summary>${codigo}<a href="${source.html_url}">Ver diagrama en GitHub ↗</a></details>`;
    })
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/(?<![\w-])(src|href)="([^"]*)"/g, (attribute, name, value) => {
      if (!value) return attribute;
      if (value.startsWith('#')) return `${name}="#${value.slice(1).startsWith('user-content-') ? value.slice(1) : 'user-content-' + value.slice(1)}"`;
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return attribute;
      return `${name}="${new URL(value, name === 'src' ? archivos : pagina).href}"`;
    });
}

const proyectos = new Set(["trello-focus","brujula-bursatil","rift-sanctum","forja-del-invocador","obs-recording-beep","MarcoBartoliFit","crecer-coach-laboral","CupidoDigitttal","Discord-Rich-Presence","aqw-wiki-item-preview","premid-youtube-music-sync","gallerypro","SqlBulkCopy-Adapter-CSharp","Bootstrap4-Course-Platzi","Library-CSharp-MySQL","Academic-System-DevSpirit","Final-Project-TUP-UTN","UTN-Academy","Bitsion-Fictitious-SA","Da-Vinci-Code-Manager"]);

async function leerLimitado(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Respuesta vacía');
  const chunks = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 2000000) { await reader.cancel(); throw new Error('Documento demasiado grande'); }
    chunks.push(value);
  }
  return new Response(new Blob(chunks)).text();
}
export function extraerReadmePublico(page, url) {
  const article = page.match(/<article\b[^>]*class="[^"]*markdown-body[^"]*"[^>]*>[\s\S]*?<\/article>/i)?.[0];
  if (!article) throw new Error('La página no contiene un README público');
  // La página de GitHub ya resuelve la rama y carpeta de sus imágenes y enlaces.
  const absolute = article.replace(/(?<![\w-])(src|href)="(\/[^"]*)"/g, (_, name, value) => name + '="' + new URL(value, 'https://github.com').href + '"');
  return prepararReadme(absolute, { html_url: url, download_url: url });
}

export async function getProjectReadme(request, context) {
  const reply = (data, status) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  if (request.method !== 'GET') return reply({ error: 'Método no permitido.' }, 405);
  const slug = new URL(request.url).pathname.slice('/api/readme/'.length);
  if (!proyectos.has(slug)) return reply({ error: 'Proyecto no disponible.' }, 404);
  const cache = globalThis.caches?.default;
  const key = new Request(new URL('/api/readme/' + slug, request.url));
  const cached = await cache?.match(key);
  if (cached) return cached;
  try {
    const endpoint = `https://api.github.com/repos/GermanBartoli/${slug}/readme`;
    // No enviar credenciales: solamente se admiten repositorios públicos.
    const headers = { 'User-Agent': 'Portfolio-GermanBartoli', Accept: 'application/vnd.github+json' };
    let html;
    let url;
    try {
      const metadata = await fetch(endpoint, { headers, signal: AbortSignal.timeout(10000) });
      if (metadata.status === 404) return reply({ error: 'README no disponible.' }, 404);
      if (!metadata.ok) throw new Error('metadatos HTTP ' + metadata.status);
      const source = JSON.parse(await leerLimitado(metadata));
      const response = await fetch(endpoint, { headers: { ...headers, Accept: 'application/vnd.github.html+json' }, signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('HTML HTTP ' + response.status);
      html = prepararReadme(await leerLimitado(response), source);
      url = source.html_url;
    } catch (error) {
      // Registrar solo un código de diagnóstico; nunca contenido ni credenciales.
      console.warn(JSON.stringify({ event: 'readme_api_fallback', reason: /^metadatos HTTP \d+$|^HTML HTTP \d+$/.test(error.message) ? error.message : 'respuesta no disponible' }));
      url = 'https://github.com/GermanBartoli/' + slug;
      const page = await fetch(url, { headers: { 'User-Agent': 'Portfolio-GermanBartoli', Accept: 'text/html' }, signal: AbortSignal.timeout(10000) });
      if (page.status === 404) return reply({ error: 'README no disponible.' }, 404);
      if (!page.ok) throw new Error('Página pública no disponible');
      html = extraerReadmePublico(await leerLimitado(page), url);
    }
    const result = new Response(JSON.stringify({ html, url }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' } });
    if (cache && context) context.waitUntil(cache.put(key, result.clone()));
    return result;
  } catch {
    return reply({ error: 'No pudimos consultar GitHub. Intentá más tarde.' }, 503);
  }
}
