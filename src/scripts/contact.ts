document.addEventListener('astro:page-load', () => {
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = 'true';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )!;
    const status = document.getElementById('form-status')!;
    button.disabled = true;
    status.textContent = 'Enviando tu mensaje…';
    try {
      const response = await fetch(
        form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'),
        {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
          signal: AbortSignal.timeout(20000),
        },
      );
      const result = await response.json();
      if (/activation/i.test(String(result.message || '')))
        throw new Error(
          'El formulario necesita activación. Mientras tanto, podés contactarme por LinkedIn.',
        );
      if (
        !response.ok ||
        (result.success !== true && result.success !== 'true')
      )
        throw new Error(
          'No se pudo enviar el mensaje. Intentá nuevamente en un momento o contactame por LinkedIn.',
        );
      status.textContent = '¡Mensaje enviado! Gracias por escribirme.';
      form.reset();
    } catch (error) {
      status.textContent =
        error instanceof Error && error.name !== 'TimeoutError'
          ? error.message
          : 'El envío tardó demasiado. Intentá nuevamente en un momento.';
    } finally {
      button.disabled = false;
    }
  });
});
