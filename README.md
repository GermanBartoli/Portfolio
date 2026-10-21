# German Bartoli · Portfolio

Un espacio para reunir software, proyectos, videos y el recorrido detrás del código.

**Sitio:** [germanbartoli.pages.dev](https://germanbartoli.pages.dev) · **Archivo:** [Portfolio-legacy](https://github.com/GermanBartoli/Portfolio-legacy)

## Base tecnológica

Astro genera páginas HTML rápidas y optimizadas; TypeScript organiza los datos y las interacciones. CSS maneja la composición, animaciones y adaptación a celulares. Cloudflare Pages publica los archivos y FormSubmit recibe los mensajes mediante un identificador anónimo, sin exponer el destinatario.

## Desarrollo

Requisitos: Node.js 22.12 o posterior y npm.

```powershell
npm ci
npm run dev
npm test
npm run build
```

`npm run dev` abre el sitio local en `http://127.0.0.1:4321`. Los envíos reales del formulario se prueban desde el dominio público: FormSubmit activa cada origen por separado. Para probar la API alternativa: `npx wrangler pages dev dist`, con `CONTACT_RECIPIENT` en un archivo `.dev.vars` ignorado por Git.

## Estructura

```text
src/
  components/       Formulario, tarjetas de proyectos y presencia
  data/             Proyectos, trayectoria, redes y videos
  layouts/          Documento, SEO y navegación compartida
  pages/            Inicio, proyectos individuales, 404 y sitemap
  scripts/          Interacciones, contacto y cliente Lanyard
  styles/           Sistema visual y diseño adaptable
public/
  images/           Imágenes de proyectos optimizadas a WebP
  _worker.js        API alternativa de contacto; no usada por el formulario público
  _headers          Cabeceras de seguridad
  _routes.json      El Worker solo recibe rutas /api/*
tests/              Pruebas del formulario
docs/               Arquitectura, contenido y verificación
scripts/            Utilidades de publicación
.github/workflows/  Validación continua
```

## Agregar contenido

- **Proyecto:** agregá un objeto en `src/data/projects.ts`. Su página se genera automáticamente. `featured` lo muestra en la selección principal; los demás aparecen en el archivo. Optimizá su imagen y guardala en `public/images/`.
- **Trayectoria, redes o videos:** editá `src/data/profile.ts`.
- **Nueva página:** agregá un archivo en `src/pages/` usando `Layout.astro`.
- **Diseño:** las variables de color y tipografía están al comienzo de `src/styles/global.css`.

## Discord en vivo

La tarjeta usa la API pública y el WebSocket de [Lanyard](https://github.com/Phineas/lanyard). Incluye avatar, decoración disponible, nombre, estado, estado personalizado, actividades, carátula y tiempos. Reconecta con espera progresiva y libera conexiones al navegar. Al perder conectividad muestra un estado no disponible; no inventa una presencia online.

El usuario debe permanecer en el servidor de Lanyard y compartir su actividad. Insignias, colección de juegos, amigos y algunas decoraciones privadas de Discord no están disponibles en su API. El marco dorado del sitio es una interpretación visual, no una captura estática del perfil.

## Formulario y privacidad

El formulario público envía directamente por AJAX a FormSubmit, igual que el sitio de Marco Bartoli Fit. Usa un identificador anónimo activado por el propietario, validación del navegador, campo trampa y las protecciones del proveedor. El correo real no aparece en HTML, JavaScript cliente ni documentación pública. Si no hay JavaScript, el formulario usa el envío HTML convencional.

Se conserva `POST /api/contact` como API alternativa: valida origen, tamaño, campos y un límite orientativo por IP con KV. El destinatario de esa API es el secreto `CONTACT_RECIPIENT` de Cloudflare. Esta ruta encontró limitaciones del proveedor al enviar desde el servidor y **no es la ruta del formulario público**.

KV tiene consistencia eventual: el límite reduce abuso ordinario, pero no garantiza un contador atómico frente a peticiones concurrentes. Para tráfico mayor se puede añadir Turnstile y un limitador atómico.

## Publicación

Proyecto Cloudflare Pages: `germanbartoli`, rama de producción `main`.

```powershell
npm test
npm run build
npx wrangler login
npm run deploy
```

Configurar `CONTACT_RECIPIENT` como secreto y conservar el binding `CONTACT_LIMITS`. La publicación inicial usa carga directa: la integración Git de Cloudflare no estaba operativa. Hacer push a GitHub ejecuta validaciones; **no publica automáticamente en Cloudflare**.

## Documentación

- [Arquitectura y decisiones](docs/ARQUITECTURA.md)
- [Origen del contenido](docs/CONTENIDO.md)
- [Verificaciones](docs/VERIFICACION.md)
- [Cómo contribuir](CONTRIBUTING.md)
- [Historial](CHANGELOG.md)

## Autor

Creado por [German Bartoli](https://github.com/GermanBartoli). Código bajo licencia MIT. Las imágenes de proyectos y marcas mantienen sus derechos originales; ver [créditos](docs/CONTENIDO.md).
