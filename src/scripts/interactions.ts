let cleanup: (() => void) | undefined;

function setup() {
  cleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const navigation = document.querySelector<HTMLElement>('.section-nav');
  const overflow = document.querySelector<HTMLDetailsElement>('.nav-overflow');
  const inlineLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));
  const menuLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-overflow-link]'));
  const arrangeNavigation = () => {
    if (!navigation || !overflow) return;
    const mobile = matchMedia('(max-width: 700px)').matches;
    overflow.hidden = false;
    inlineLinks.forEach(link => { link.hidden = mobile; });
    const available = navigation.clientWidth - overflow.offsetWidth - 24;
    const row = navigation.querySelector<HTMLElement>('.nav-inline');
    for (let index = inlineLinks.length - 1; !mobile && row && row.scrollWidth > available && index >= 0; index--) {
      inlineLinks[index].hidden = true;
    }
    menuLinks.forEach((link, index) => { link.hidden = !inlineLinks[index].hidden; });
    overflow.hidden = !inlineLinks.some(link => link.hidden);
    const label = overflow.querySelector('.nav-more-label');
    if (label) label.textContent = mobile ? 'Secciones' : 'Más';
  };
  const navigationResize = new ResizeObserver(arrangeNavigation);
  if (navigation) navigationResize.observe(navigation);
  arrangeNavigation();
  document.fonts.ready.then(() => { if (!signal.aborted) arrangeNavigation(); });
  navigation?.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a') && overflow) overflow.open = false;
  }, { signal });
  document.addEventListener('click', (event) => {
    if (overflow && !overflow.contains(event.target as Node)) overflow.open = false;
  }, { signal });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overflow?.open) {
      overflow.open = false;
      overflow.querySelector('summary')?.focus();
    }
  }, { signal });
  const backToTop = document.querySelector<HTMLElement>('.back-to-top');
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
    backToTop?.classList.toggle('is-visible', scrollY > innerHeight * 0.6);
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
  const orbit = document.querySelector<HTMLElement>('.orbit-scene');
  if (orbit) {
    let rotationX = 0;
    let rotationY = 0;
    let pointer: number | undefined;
    let lastX = 0;
    let lastY = 0;
    const rotate = (x: number, y: number) => {
      rotationX = Math.max(-85, Math.min(85, x));
      rotationY = y % 360;
      orbit.style.setProperty('--orbit-x', rotationX + 'deg');
      orbit.style.setProperty('--orbit-y', rotationY + 'deg');
    };
    orbit.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0 || pointer !== undefined) return;
      pointer = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      orbit.setPointerCapture(pointer);
      orbit.classList.add('is-dragging');
      orbit.focus({ preventScroll: true });
    }, { signal });
    orbit.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointer) return;
      rotate(rotationX - (event.clientY - lastY) * 0.5, rotationY + (event.clientX - lastX) * 0.5);
      lastX = event.clientX;
      lastY = event.clientY;
    }, { signal });
    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return;
      pointer = undefined;
      orbit.classList.remove('is-dragging');
      if (orbit.hasPointerCapture(event.pointerId)) orbit.releasePointerCapture(event.pointerId);
    };
    orbit.addEventListener('pointerup', finishDrag, { signal });
    orbit.addEventListener('pointercancel', finishDrag, { signal });
    orbit.addEventListener('lostpointercapture', finishDrag, { signal });
    orbit.addEventListener('keydown', (event) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') rotate(0, 0);
      else rotate(rotationX + (event.key === 'ArrowUp' ? -10 : event.key === 'ArrowDown' ? 10 : 0),
        rotationY + (event.key === 'ArrowLeft' ? -10 : event.key === 'ArrowRight' ? 10 : 0));
    }, { signal });
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
    navigationResize.disconnect();
    clearInterval(clockTimer);
    cancelAnimationFrame(frame);
    document.documentElement.classList.remove('motion-ready');
  };
}
document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => cleanup?.());
