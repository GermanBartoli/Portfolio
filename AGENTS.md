# Portfolio personal

Antes de publicar, leer [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md).

Cada push a main publica automáticamente en Cloudflare Pages después de las pruebas y el build. Un commit local no publica. No es necesario un despliegue manual. Preservar CRLF.

## Desarrollo y verificación

Las páginas de Astro están en `src/pages`, los componentes en `src/components` y los datos en `src/data`. Para cambios en el contacto o la actividad de GitHub, revisá también `public/_worker.js` y las pruebas correspondientes en `tests`.

Corré `pnpm test` y `pnpm run build`. El build comprueba Astro y TypeScript. Si cambiás rutas o enlaces, probá también la copia que se sirve desde la subcarpeta de GitHub Pages.

Consultá los pasos de publicación en [el flujo de GitHub Actions](.github/workflows/validar.yml). Para verificar los dos sitios publicados, seguí [la guía de publicación](docs/PUBLICACION.md).
