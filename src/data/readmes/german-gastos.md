# Germán Gastos

**Todo en su lugar. Tus gastos fijos, claros y al día, en un espacio privado.**

[![Repositorio](https://img.shields.io/badge/GitHub-GermanBartoli-181717?logo=github)](https://github.com/GermanBartoli/german-gastos)

[Abrir en Cloudflare](https://german-gastos.bartoligerman497.workers.dev/) · [Empezar](#primeros-pasos) · [Mapa del repositorio](#mapa-del-repositorio) · [Autoría](#autoría-de-esta-documentación)

![Vista del proyecto: Germán Gastos](/images/german-gastos.png)

*Cabecera de la aplicación publicada, capturada el 9 de noviembre de 2026. Recorte a resolución original, sin recomprimir y sin importes personales.*

## Primeros pasos

1. [Abrí Germán Gastos](https://german-gastos.bartoligerman497.workers.dev/) e ingresá con tu cuenta autorizada mediante Cloudflare Access.
2. Elegí el mes y la moneda para revisar cuánto tenés previsto, cuánto pagaste y cuánto queda pendiente.
3. Usá **Agregar gasto** para cargar una recurrencia y **Marcar pagado** cuando resuelvas el pago del mes.
4. En **Configuración**, exportá un respaldo o revisá un archivo JSON antes de importarlo.

## Qué podés hacer

| Función | Para qué sirve |
| --- | --- |
| Mi mes | Ver presupuesto, pagos y pendientes de un vistazo. |
| Gastos recurrentes | Organizar importes, categorías y días de pago. |
| ARS y USD | Consultar cada moneda por separado. |
| Historial mensual | Conservar el importe de los pagos registrados. |
| Respaldos | Exportar tus datos y revisar una importación antes de confirmarla. |
| Acceso privado | Mantener los datos separados por cuenta autorizada. |

## Tecnologías

React, TypeScript, Vite, Tailwind CSS, Lucide, Simple Icons y Cloudflare Workers con D1. Dependencias administradas con pnpm y lockfile versionado. En Windows se reutiliza el almacén personal configurado de pnpm.

## Uso

- Elegir el mes y la moneda. Los totales ARS y USD se muestran por separado.
- Agregar gastos recurrentes con nombre, importe, día, categoría e ícono.
- Marcar pagos independientemente en cada mes. Los pagos registrados conservan su importe.
- Para eliminar un gasto, usá la papelera junto a editar o **Eliminar gasto** dentro de su tarjeta. La confirmación advierte que se borrarán también sus pagos de todos los meses.
- Para finalizar una recurrencia, establecer el último mes en el editor.
- Configuración permite exportar JSON y revisar un respaldo antes de reemplazar los datos propios.
- Importar el mismo respaldo reemplaza los datos de forma transaccional y no genera duplicados. Una revisión optimista evita sobrescribir cambios concurrentes.

## Desarrollo y verificación

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm exec wrangler d1 migrations apply german-gastos --local
pnpm exec wrangler dev
```

La API requiere una identidad válida de Access también al ejecutar el Worker local. Las pruebas usan SQLite en memoria para verificar separación de cuentas, transacciones y concurrencia. No existe una puerta de acceso de desarrollo en producción.

## Seguridad y publicación

El Worker verifica firma, emisor y audiencia del JWT de Access para todas las rutas. La autorización se limita a los correos configurados en `ALLOWED_EMAILS` y en la política de Cloudflare Access. Inicialmente solo Germán. La identidad procede de la sesión, nunca del cuerpo de una solicitud.

Las solicitudes de escritura verifican el origen, el formato, las relaciones y los importes enteros en centavos. La base separa cuentas, gastos y pagos con claves compuestas. La escritura de respaldos usa una transacción y control de revisión. El límite de respaldo es 2 MB, 2.000 gastos y 50.000 pagos.

GitHub Actions verifica y publica los pushes a `main`. Requiere los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`. El token de configuración y los datos financieros permanecen fuera del repositorio. Para sumar usuarios se actualizan tanto la política de Access como la lista autorizada del Worker.

## Datos iniciales

Los candidatos procedentes de Mercado Pago se cargan de manera privada en la base de Germán. Los importes recientes son referencias, y los candidatos tienen notas para revisar la recurrencia. Los PDF, sus extracciones y los importes personales no se versionan.

La importación de la aplicación admite respaldos JSON. Los PDF de Mercado Pago se analizan por separado y no se leen automáticamente desde una carpeta del equipo.

## Evolución

La primera versión usa una API de respaldo completo. Para volúmenes mayores, ampliar con operaciones por gasto y pago y consultas mensuales paginadas sobre las tablas existentes. Añadir importación guiada de extractos de Mercado Pago conservando identificadores de operación para evitar duplicados.

## Mapa del repositorio

| Ruta | Contenido |
| --- | --- |
| `src/` | Interfaz React y estilos de la aplicación. |
| `worker/` | API, autenticación y acceso a los datos. |
| `shared/` | Tipos y reglas compartidas. |
| `migrations/` | Evolución de la base de datos D1. |
| `tests/` | Pruebas de validación, aislamiento y persistencia. |
| `docs/images/` | Capturas utilizadas en esta documentación. |
| `.github/workflows/publicar.yml` | Verificación y publicación automática. |

## Autoría de esta documentación

Proyecto de [Germán Bartoli](https://germanbartoli.pages.dev/). Documentación preparada con asistencia de Codex y basada en los archivos y la aplicación verificados.
