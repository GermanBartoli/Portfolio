// Recibe un JWT temporal por stdin sin eco; nunca se guarda en el repositorio.
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
console.log('Listo para recibir autorización temporal por stdin sin eco.');
let input = '';
process.stdin.on('data', async (chunk) => {
  input += chunk;
  if (!input.includes('\n') && !input.includes('\r')) return;
  process.stdin.pause();
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  const jwt = input.trim();
  input = '';
  try {
    const manifest = {};
    const assets = [];
    const mime = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.xml': 'application/xml',
      '.txt': 'text/plain',
      '.json': 'application/json',
    };
    for (const path of await readdir('dist', { recursive: true })) {
      if (
        path.startsWith('_worker') ||
        ['_headers', '_routes.json', '_redirects'].includes(path)
      )
        continue;
      let value;
      try {
        value = await readFile('dist/' + path);
      } catch {
        continue;
      }
      const key = createHash('sha256')
        .update(value)
        .update(extname(path))
        .digest('hex')
        .slice(0, 32);
      manifest['/' + path.replaceAll('\\', '/')] = key;
      assets.push({
        key,
        value: value.toString('base64'),
        base64: true,
        metadata: {
          contentType: mime[extname(path)] || 'application/octet-stream',
        },
      });
    }
    for (let i = 0; i < assets.length; i += 10) {
      const response = await fetch(
        'https://api.cloudflare.com/client/v4/pages/assets/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assets.slice(i, i + 10)),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(JSON.stringify(result.errors));
      console.log(
        `Archivos cargados: ${Math.min(i + 10, assets.length)}/${assets.length}`,
      );
    }
    await mkdir('.wrangler', { recursive: true });
    await writeFile('.wrangler/upload-manifest.json', JSON.stringify(manifest));
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
});
