# Publicación automática en Cloudflare

El portfolio está en C:\Cosas\Proyectos\Portfolio.

El workflow .github/workflows/validar.yml ejecuta npm ci, npm test y npm run build. Cada push a main publica automáticamente dist en el proyecto Cloudflare Pages germanbartoli mediante npm run deploy. Los pull requests y otras ramas solo validan.

## Trabajo habitual

Preparar los cambios, hacer commit y push a main. Un commit local sin push no publica. No hace falta desplegar manualmente ni volver a introducir credenciales. Comprobar el resultado en GitHub Actions después del push.

El secreto CLOUDFLARE_API_TOKEN se configura en GitHub Actions. El Account ID ya está definido en el workflow, por eso este repositorio solo necesita el token como secreto. No copiar credenciales a archivos versionados.

Cuando el usuario pida solamente «commit», proponer el mensaje sin ejecutar commit ni push. Cuando solicite hacer el commit, completar también el push y verificar la ejecución de publicación.
