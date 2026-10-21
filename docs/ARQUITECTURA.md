# Arquitectura

## Separación de responsabilidades

Los datos tipados viven en `src/data`; los componentes presentan esos datos; las páginas componen la experiencia. Las interacciones se cargan como módulos independientes. Esto permite sumar proyectos, páginas y funciones sin convertir el inicio en un archivo monolítico.

Astro genera el contenido en compilación. El visitante recibe HTML navegable incluso sin JavaScript. JavaScript agrega filtros, reproducción de videos, transiciones, movimiento y presencia. El formulario usa AJAX para responder dentro de la página y conserva un envío HTML convencional sin JavaScript.

## Flujo de contacto

Navegador → FormSubmit AJAX con identificador anónimo → buzón configurado y activado por su propietario.

El identificador público permite enviar al formulario sin mostrar el correo. Las respuestas de error o activación pendiente nunca se presentan como entrega exitosa. Los datos se procesan por FormSubmit; no hay almacenamiento de mensajes en el sitio.

La API alternativa `/api/contact` conserva un secreto solo en Cloudflare. El Worker limita la lectura a 12 KB, verifica el origen cuando está presente, valida campos y evita confirmar respuestas ambiguas del proveedor. Los datos del mensaje no se almacenan en KV; solo un hash de IP y un contador con vencimiento. No se registran cuerpos ni credenciales. El formulario público no usa esta ruta porque el proveedor limitó los envíos desde la infraestructura del servidor.

## Presencia

La primera consulta REST completa la tarjeta; el WebSocket recibe cambios y mantiene heartbeat. La conexión se cierra con la página oculta o al navegar y vuelve a crearse al regresar. El DOM se actualiza con `textContent` y nodos, sin interpolar HTML del servicio externo. Los enlaces de escucha se limitan a YouTube Music y Spotify.

## Movimiento

La narrativa cambia mediante scroll, secciones sticky, revelado de texto, paralaje y progreso. Botones magnéticos, luces de hover, inclinación leve, brillo ambiental y órbitas animadas acompañan la composición. Las páginas individuales comparten imágenes mediante View Transitions. La caja de herramientas tiene desplazamiento horizontal accesible por teclado y gestos. `prefers-reduced-motion` elimina el movimiento decorativo.

## Evolución prevista

1. Añadir estudios de caso con problema, decisiones y resultados comprobables.
2. Migrar contenido editorial extenso a colecciones Markdown cuando haga falta.
3. Añadir integración continua de despliegue cuando la instalación Git de Cloudflare esté disponible.
4. Incorporar métricas respetuosas de la privacidad solo si se decide hacerlo.

No hay base de datos, cuentas ni CMS porque esta primera versión no los necesita.
