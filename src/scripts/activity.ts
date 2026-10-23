export {};
type Day = { date: string; value: number; level?: number };
type Metric = { name: string; percent: number; seconds?: number };
type WakaData = { updatedAt: string; total: number; average: number; days: { date: string; total: number }[]; groups: { key: string; label: string; items: Metric[] }[] };
let cleanup: (() => void) | undefined;
const dateLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const duration = (seconds: number) => `${Math.floor(seconds / 3600).toLocaleString('es-AR')} h ${Math.floor(seconds % 3600 / 60)} min`;
const tokens = (value: number) => value === 0 ? '0 tokens' : `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value >= 1e6 ? value / 1e6 : value / 1e3)} ${value >= 1e6 ? 'M' : 'mil'} tokens`;

function renderHeatmap(grid: HTMLElement, months: HTMLElement | null, detail: HTMLElement | null, days: Day[], format: (value: number) => string, signal: AbortSignal, blue = false) {
  const fragment = document.createDocumentFragment();
  const max = Math.max(1, ...days.map(day => day.value));
  const offset = days.length ? new Date(`${days[0].date}T12:00:00Z`).getUTCDay() : 0;
  for (let i = 0; i < offset; i++) { const spacer = document.createElement('span'); spacer.className = 'heatmap-empty'; fragment.append(spacer); }
  days.forEach((day, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'heatmap-day';
    button.tabIndex = index === days.length - 1 ? 0 : -1;
    const level = day.level ?? (day.value === 0 ? 0 : Math.min(4, Math.ceil(day.value / max * 4)));
    button.dataset.level = String(level);
    const label = `${dateLabel(day.date)} · ${format(day.value)}`;
    button.setAttribute('aria-label', label);
    button.title = label;
    const select = () => { if (detail) detail.textContent = label; };
    button.addEventListener('pointerenter', select, { signal });
    button.addEventListener('focus', select, { signal });
    button.addEventListener('click', select, { signal });
    fragment.append(button);
  });
  grid.replaceChildren(fragment);
  grid.classList.toggle('heatmap-blue', blue);
  grid.style.setProperty('--weeks', String(Math.ceil((days.length + offset) / 7)));
  if (months) {
    months.replaceChildren();
    let previous = '';
    days.forEach((day, index) => {
      const month = day.date.slice(0, 7);
      if (month !== previous && index > 0) {
        const label = document.createElement('span');
        label.textContent = new Date(`${day.date}T12:00:00Z`).toLocaleDateString('es-AR', { month: 'short', timeZone: 'UTC' });
        label.style.left = `${Math.floor((index + offset) / 7) / Math.ceil((days.length + offset) / 7) * 100}%`;
        months.append(label);
      }
      previous = month;
    });
  }
}

function setupActivity() {
  cleanup?.();
  const controller = new AbortController();
  const { signal } = controller;
  document.querySelectorAll<HTMLElement>('.heatmap').forEach(grid => {
    grid.addEventListener('keydown', event => {
      const steps: Record<string, number> = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 };
      if (!(event.key in steps)) return;
      const buttons = Array.from(grid.querySelectorAll('button'));
      const index = buttons.indexOf(event.target as HTMLButtonElement);
      if (index < 0) return;
      event.preventDefault();
      buttons[index].tabIndex = -1;
      const next = buttons[Math.max(0, Math.min(buttons.length - 1, index + steps[event.key]))];
      next.tabIndex = 0; next.focus();
    }, { signal });
  });
  const codex = document.querySelector<HTMLElement>('[data-codex]');
  if (codex) {
    const data = JSON.parse(codex.dataset.codex || '{}') as { start: string; count: number; daily: [number, number][] };
    const values = new Map(data.daily);
    const days: Day[] = Array.from({ length: data.count }, (_, index) => ({ date: new Date(Date.parse(`${data.start}T12:00:00Z`) + index * 86400000).toISOString().slice(0, 10), value: (values.get(index) || 0) * 1e6 }));
    let modeController: AbortController | undefined;
    const draw = (mode: string) => {
      modeController?.abort(); modeController = new AbortController();
      let running = 0;
      const displayed = days.map((day, index) => {
        running += day.value;
        const value = mode === 'cumulative' ? running : mode === 'weekly' ? days.slice(Math.floor(index / 7) * 7, Math.floor(index / 7) * 7 + 7).reduce((sum, entry) => sum + entry.value, 0) : day.value;
        return { ...day, value, ...(mode === 'daily' ? { level: value === 0 ? 0 : value < 16e6 ? 1 : value < 32e6 ? 2 : value < 50e6 ? 3 : 4 } : {}) };
      });
      const grid = codex.querySelector<HTMLElement>('[data-codex-grid]');
      if (grid) renderHeatmap(grid, codex.querySelector('[data-codex-months]'), codex.querySelector('[data-codex-detail]'), displayed, value => `${tokens(value)}${mode === 'weekly' ? ' · total de la semana' : mode === 'cumulative' ? ' · acumulado del período' : ''}`, modeController.signal, true);
      const detail = codex.querySelector('[data-codex-detail]');
      if (detail) detail.textContent = 'Pasá el mouse, tocá un día o usá las flechas para ver el consumo.';
      codex.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    };
    draw('daily');
    signal.addEventListener('abort', () => modeController?.abort(), { once: true });
    codex.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => draw(button.dataset.mode || 'daily'), { signal }));
  }
  const waka = document.querySelector<HTMLElement>('[data-wakatime]');
  const loadWaka = async () => {
    if (!waka) return;
    const status = waka.querySelector<HTMLElement>('[data-waka-status]');
    try {
      const response = await fetch('/api/activity/wakatime', { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
      if (!response.ok) throw new Error('WakaTime no disponible');
      const data: WakaData = await response.json();
      if (signal.aborted) return;
      waka.querySelector('[data-waka-total]')!.textContent = duration(data.total);
      waka.querySelector('[data-waka-average]')!.textContent = duration(data.average);
      const grid = waka.querySelector<HTMLElement>('[data-waka-grid]');
      if (grid) renderHeatmap(grid, waka.querySelector('[data-waka-months]'), waka.querySelector('[data-waka-detail]'), data.days.map(day => ({ date: day.date, value: day.total })), value => `${duration(value)} · estimación pública de WakaTime`, signal);
      const charts = waka.querySelector('[data-waka-charts]')!;
      charts.replaceChildren();
      data.groups.forEach(group => {
        if (!group.items.length) return;
        const section = document.createElement('section');
        const title = document.createElement('h3'); title.textContent = group.label; section.append(title);
        const list = document.createElement('div'); list.className = 'metric-list';
        group.items.forEach(item => {
          const row = document.createElement('div'); row.className = 'metric-row';
          const label = document.createElement('span'); label.textContent = item.name;
          const value = document.createElement('span'); value.textContent = `${item.percent.toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`;
          const bar = document.createElement('i'); bar.style.setProperty('--percent', `${Math.max(0.25, Math.min(100, item.percent))}%`);
          row.title = item.seconds === undefined ? `${item.name}: ${value.textContent}` : `${item.name}: ${duration(item.seconds)}`;
          row.append(label, value, bar); list.append(row);
        });
        section.append(list); charts.append(section);
      });
      waka.querySelector<HTMLElement>('[data-waka-content]')!.hidden = false;
      if (status) status.textContent = `Sincronizado con WakaTime · ${new Date(data.updatedAt).toLocaleString('es-AR')} · caché de 15 minutos. El calendario público muestra estimaciones; las estadísticas se actualizan al ritmo de WakaTime.`;
    } catch {
      if (!signal.aborted && status) status.textContent = 'WakaTime no está disponible en este momento. Podés consultar mi perfil con el enlace de abajo.';
    }
  };
  void loadWaka();
  const timer = window.setInterval(() => { if (!document.hidden) void loadWaka(); }, 15 * 60 * 1000);
  cleanup = () => { controller.abort(); clearInterval(timer); };
}
document.addEventListener('astro:page-load', setupActivity);
document.addEventListener('astro:before-swap', () => cleanup?.());
