# Verificación

## Resultado del 21 de octubre de 2026

- Compilación de Astro y TypeScript sin errores ni advertencias.
- Navegador integrado: filtros, página individual y regreso, ambos videos reproduciendo, cierre con Escape y eliminación del iframe.
- Presencia real observada con música y estado «No molestar»; más tarde cambió correctamente a «Desconectado».
- Formulario público activado por el propietario, confirmación «¡Mensaje enviado!» y mensaje recibido en Gmail.
- Sin imágenes rotas ni desbordamiento horizontal en la vista comprobada de 713 px. No se completó una matriz de dispositivos físicos.
- Dominio público y detalle de proyecto: HTTP 200. Página inexistente: HTTP 404.
- La API alternativa de correo presentó una limitación del proveedor; el formulario público funciona con AJAX directo mediante identificador anónimo.

## Comprobaciones automatizadas

- `npm test`: validación de origen y tamaño, campo trampa, destinatario ausente, datos inválidos, éxito del proveedor, activación pendiente, respuestas ambiguas, rechazo y límite de envíos.
- `npm run build`: comprobación Astro/TypeScript y generación estática de inicio, 15 proyectos, 404 y sitemap.
- `npm audit`: comprobación de dependencias durante la instalación.

## Comprobaciones funcionales

Revisar en navegador integrado: inicio, filtros, archivo, navegación a proyecto y regreso, video y cierre con Escape, presencia real de Discord, formulario y adaptación a tamaños de pantalla. Verificar también ausencia de desbordamiento horizontal e imágenes rotas.

La entrega de correo solo se considera confirmada al observar el mensaje en el buzón, no por una respuesta HTTP aislada. FormSubmit puede requerir activación por parte del destinatario.

## Publicación

Verificar respuesta HTTP del dominio, un proyecto individual, recursos estáticos, 404, `/api/contact`, autoría Git y coincidencia de HEAD local con remoto. El directorio de trabajo debe quedar limpio y los archivos de texto en CRLF.
