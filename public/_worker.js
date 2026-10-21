const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin)
    return json({ ok: false, error: 'Origen no permitido.' }, 403);
  if (!env.CONTACT_RECIPIENT)
    return json(
      { ok: false, error: 'El formulario todavía no está configurado.' },
      503,
    );
  if (Number(request.headers.get('content-length') || 0) > 12000)
    return json({ ok: false, error: 'El mensaje es demasiado largo.' }, 413);

  let form;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ ok: false, error: 'Faltan los datos.' }, 400);
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12000) {
        await reader.cancel();
        return json(
          { ok: false, error: 'El mensaje es demasiado largo.' },
          413,
        );
      }
      chunks.push(value);
    }
    form = await new Response(new Blob(chunks), {
      headers: { 'Content-Type': request.headers.get('Content-Type') || '' },
    }).formData();
  } catch {
    return json({ ok: false, error: 'No pudimos leer el formulario.' }, 400);
  }

  if (form.get('website')) return json({ ok: true });

  const nombre = String(form.get('nombre') || '').trim();
  const email = String(form.get('email') || '').trim();
  const servicio = String(form.get('servicio') || '').trim();
  const mensaje = String(form.get('mensaje') || '').trim();

  if (
    !nombre ||
    nombre.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 200 ||
    !servicio ||
    mensaje.length < 10 ||
    mensaje.length > 3000
  ) {
    return json(
      { ok: false, error: 'Revisá los datos e intentá nuevamente.' },
      400,
    );
  }

  const allowed = [
    'Un proyecto web',
    'Desarrollo de software',
    'Una colaboración',
    'Otra idea',
  ];
  if (!allowed.includes(servicio))
    return json({ ok: false, error: 'Elegí un servicio válido.' }, 400);

  if (!env.CONTACT_LIMITS)
    return json(
      { ok: false, error: 'El formulario todavía no está configurado.' },
      503,
    );

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(ip),
  );
  const key = `contact:${Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  try {
    const attempts = Number(await env.CONTACT_LIMITS.get(key)) || 0;
    if (attempts >= 2)
      return json(
        { ok: false, error: 'Esperá un minuto antes de enviar otro mensaje.' },
        429,
      );
    await env.CONTACT_LIMITS.put(key, String(attempts + 1), {
      expirationTtl: 60,
    });
  } catch {
    return json({ ok: false, error: 'Intentá nuevamente más tarde.' }, 503);
  }

  const payload = new URLSearchParams({
    name: nombre,
    email,
    service: servicio,
    message: mensaje,
    _subject: 'Nuevo contacto desde el portfolio de German Bartoli',
    _template: 'table',
    _honey: '',
  });

  let response;
  try {
    response = await fetch(
      'https://formsubmit.co/ajax/' + encodeURIComponent(env.CONTACT_RECIPIENT),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Origin: new URL(request.url).origin,
          Referer: new URL(request.url).origin + '/',
        },
        body: payload.toString(),
        signal: AbortSignal.timeout(15000),
      },
    );
  } catch {
    return json(
      {
        ok: false,
        error:
          'No pudimos conectar con el servicio de correo. Intentá más tarde.',
      },
      502,
    );
  }
  let result;
  try {
    result = await response.json();
  } catch {
    return json(
      {
        ok: false,
        error: `El servicio de correo respondió con HTTP ${response.status}. Intentá más tarde.`,
      },
      502,
    );
  }
  if (/activation/i.test(String(result.message || '')))
    return json(
      {
        ok: false,
        error:
          'Falta activar el formulario: se envió un enlace de confirmación al correo del responsable.',
      },
      503,
    );
  if (response.status === 429)
    return json(
      {
        ok: false,
        error:
          'El servicio de correo está limitando los envíos. Esperá unos minutos y reintentá.',
      },
      503,
    );
  if (!response.ok || (result.success !== true && result.success !== 'true'))
    return json(
      {
        ok: false,
        error: 'El servicio de correo rechazó el envío. Intentá más tarde.',
      },
      502,
    );
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST')
        return json({ ok: false, error: 'Método no permitido.' }, 405);
      return onRequestPost({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
