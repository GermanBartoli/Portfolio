let cleanup: (() => void) | undefined;

function setup() {
  cleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const story = document.querySelector<HTMLElement>('.story-text');
  if (story && !reduced) {
    const walker = document.createTreeWalker(story, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.textContent?.split(/(\s+)/).forEach((word) => {
        if (!word.trim()) fragment.append(document.createTextNode(word));
        else {
          const span = document.createElement('span');
          span.dataset.revealWord = '';
          span.textContent = word;
          fragment.append(span);
        }
      });
      node.replaceWith(fragment);
    });
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  if (!reduced) {
    document.documentElement.classList.add('motion-ready');
    document.querySelectorAll('.reveal').forEach((element, index) => {
      (element as HTMLElement).style.transitionDelay = `${(index % 2) * 70}ms`;
      observer.observe(element);
    });
  }
  let frame = 0;
  const updateScroll = () => {
    frame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    const progress = document.querySelector<HTMLElement>('.reading-progress');
    if (progress)
      progress.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
    if (!reduced) {
      const art = document.querySelector<HTMLElement>('.hero-art');
      if (art && scrollY < innerHeight)
        art.style.translate = `0 ${scrollY * 0.09}px`;
      if (story) {
        const ratio = Math.min(
          1,
          Math.max(
            0,
            (innerHeight - story.getBoundingClientRect().top) /
              (innerHeight * 0.7),
          ),
        );
        const words = story.querySelectorAll<HTMLElement>('[data-reveal-word]');
        words.forEach((word, index) => {
          word.style.opacity = `${0.2 + Math.min(1, Math.max(0, ratio * words.length - index)) * 0.8}`;
        });
      }
      const toolbox = document.querySelector<HTMLElement>('.toolbox');
      const rail = document.querySelector<HTMLElement>('.tool-rail');
      if (toolbox && rail && innerWidth > 1000) {
        const top = toolbox.getBoundingClientRect().top;
        const ratio = Math.min(
          1,
          Math.max(0, (70 - top) / (toolbox.offsetHeight - innerHeight * 0.6)),
        );
        rail.scrollLeft = ratio * (rail.scrollWidth - rail.clientWidth);
      }
    }
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(updateScroll);
    },
    { passive: true, signal },
  );
  updateScroll();
  const clock = () => {
    const element = document.getElementById('local-time');
    if (element)
      element.textContent = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
  };
  clock();
  const clockTimer = window.setInterval(clock, 60000);
  document
    .querySelectorAll<HTMLButtonElement>('[data-filter]')
    .forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          const filter = button.dataset.filter;
          document
            .querySelectorAll('[data-filter]')
            .forEach((item) =>
              item.setAttribute('aria-pressed', String(item === button)),
            );
          let count = 0;
          document
            .querySelectorAll<HTMLElement>('[data-category]')
            .forEach((card) => {
              card.hidden =
                filter !== 'Todos' && card.dataset.category !== filter;
              if (!card.hidden) {
                count++;
                card.classList.add('is-visible');
              }
            });
          const archive =
            document.querySelector<HTMLDetailsElement>('.project-archive');
          if (archive) {
            archive.open = filter !== 'Todos';
            archive.hidden = !archive.querySelector(
              '[data-category]:not([hidden])',
            );
          }
          const status = document.getElementById('filter-status');
          if (status) status.textContent = `${count} proyectos en ${filter}.`;
        },
        { signal },
      );
    });
  if (finePointer && !reduced) {
    document.querySelectorAll<HTMLElement>('.magnetic').forEach((button) => {
      button.addEventListener(
        'pointermove',
        (event) => {
          const rect = button.getBoundingClientRect();
          button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.08}px, ${(event.clientY - rect.top - rect.height / 2) * 0.12}px)`;
        },
        { signal },
      );
      button.addEventListener(
        'pointerleave',
        () => {
          button.style.transform = '';
        },
        { signal },
      );
    });
    document.querySelectorAll<HTMLElement>('.project-image').forEach((card) => {
      card.addEventListener(
        'pointermove',
        (event) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
          card.style.transform = `perspective(1100px) rotateX(${(y / rect.height - 0.5) * -3}deg) rotateY(${(x / rect.width - 0.5) * 3}deg)`;
        },
        { signal },
      );
      card.addEventListener(
        'pointerleave',
        () => {
          card.style.transform = '';
        },
        { signal },
      );
    });
  }
  const dialog = document.querySelector<HTMLDialogElement>('#video-dialog');
  const container = document.getElementById('video-container');
  let videoTrigger: HTMLElement | undefined;
  const closeVideo = () => {
    dialog?.close();
    container?.replaceChildren();
    videoTrigger?.focus();
  };
  document
    .querySelectorAll<HTMLButtonElement>('[data-video]')
    .forEach((button) =>
      button.addEventListener(
        'click',
        () => {
          if (!dialog || !container) return;
          videoTrigger = button;
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?autoplay=1`;
          iframe.title = button.getAttribute('aria-label') || 'Video';
          iframe.allow =
            'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          container.replaceChildren(iframe);
          dialog.showModal();
        },
        { signal },
      ),
    );
  dialog
    ?.querySelector('.dialog-close')
    ?.addEventListener('click', closeVideo, { signal });
  dialog?.addEventListener(
    'close',
    () => {
      container?.replaceChildren();
      videoTrigger?.focus();
    },
    { signal },
  );
  dialog?.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) closeVideo();
    },
    { signal },
  );
  cleanup = () => {
    controller.abort();
    observer.disconnect();
    clearInterval(clockTimer);
    cancelAnimationFrame(frame);
    document.documentElement.classList.remove('motion-ready');
  };
}
document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => cleanup?.());
