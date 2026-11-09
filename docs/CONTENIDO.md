# Origen del contenido

La fuente inicial fue `GermanBartoli/Portfolio`, conservado como `Portfolio-legacy`. No se reutilizaron fotos de esa página.

## Migrado

- Experiencia: Fidelitytools desde diciembre de 2022; DevSpirit de enero a abril de 2022.
- Formación: UTN, Instituto Nuestra Señora de Lourdes, Platzi y Platzi English Academy.
- Redes: GitHub, LinkedIn, WakaTime y Platzi.
- Ocho proyectos originales y dos videos de YouTube: `N5lNz-4JgM0` y `70DKH_uk7AQ`.
- Ubicación pública: Villa Allende, Córdoba, Argentina.

No se trasladaron porcentajes subjetivos de habilidades ni duraciones antiguas desactualizadas. El correo destinatario no se publica. Los proyectos Empresa Ficticia S.A. y Da Vinci Code Manager conservan sus enlaces históricos: no aparecían en el listado público de GitHub al realizar la migración. El año del archivo corresponde a la etapa del portfolio anterior, no a una fecha de release verificada para esos dos proyectos.

## Incorporado

OBS Recording Beep, Marco Bartoli Fit, Cupido Digitttal, Discord Rich Presence, AQW Wiki Item Preview, YouTube Music Sync y GalleryPRO. El orden principal sigue su creación, de más reciente a más antiguo.

Las descripciones se basan en los README y metadatos públicos de cada repositorio. Las imágenes provienen de los proyectos locales, convertidas a WebP: configuración de OBS, portada de Marco, arte de Cupido, icono de la extensión Discord, captura de AQW Wiki, interfaz de referencia de PreMiD y logotipo de GalleryPRO. No todas son capturas de una función ejecutándose; se indica cuando son identidad o referencia.

## Créditos

- Tipografías DM Sans y Manrope servidas por Google Fonts, bajo sus licencias abiertas.
- Presencia proporcionada por Lanyard y datos públicos del usuario de Discord.
- Miniaturas y videos servidos por YouTube. La reproducción solo se carga al pulsar el botón.
- La captura de AQW Wiki conserva los derechos de sus autores; la wiki indica CC BY-SA 3.0 salvo indicación contraria. Fuente: `https://aqwwiki.wikidot.com/`.
- Marcas, logos y contenido de proyectos pertenecen a sus respectivos titulares.

## README en las fichas de proyectos

Cada ficha consulta `/api/readme/:repositorio` al abrirse. El Worker obtiene el HTML sanitizado de GitHub sin credenciales, adapta las rutas a la rama y carpeta reales y guarda la respuesta en caché durante 5 minutos. Los cambios del README no requieren recompilar ni publicar el portfolio. No se conserva una copia versionada de los documentos ni se incorpora contenido privado.

El navegador cancela la consulta al cambiar de página, admite reintentos y muestra un aviso cuando el documento no existe o GitHub está temporalmente limitado. Se mantiene un enlace directo al original. Los diagramas Mermaid conservan su código y un enlace para verlos renderizados en GitHub.
