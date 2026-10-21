interface Activity {
  name: string;
  type: number;
  details?: string;
  state?: string;
  application_id?: string;
  details_url?: string;
  assets?: { large_image?: string };
  timestamps?: { start?: number; end?: number };
  emoji?: { name: string };
}
interface Presence {
  discord_status: string;
  discord_user: {
    id: string;
    username: string;
    global_name?: string;
    avatar?: string;
    avatar_decoration_data?: { asset: string };
    primary_guild?: { tag?: string };
  };
  activities: Activity[];
}
let dispose: (() => void) | undefined;
const labels: Record<string, string> = {
  online: 'En línea',
  idle: 'Ausente',
  dnd: 'No molestar',
  offline: 'Desconectado',
};
function assetUrl(activity: Activity) {
  const image = activity.assets?.large_image;
  if (!image) return undefined;
  if (image.startsWith('mp:'))
    return `https://media.discordapp.net/${image.slice(3)}`;
  if (/^https:\/\//.test(image)) return image;
  if (activity.application_id)
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`;
}
function text(tag: string, value: string, className?: string) {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
}
function setupPresence() {
  dispose?.();
  const root = document.querySelector<HTMLElement>('[data-discord-id]');
  if (!root) return;
  const id = root.dataset.discordId!;
  let socket: WebSocket | undefined;
  let heartbeat = 0;
  let retry = 0;
  let failures = 0;
  let stopped = false;
  let lastUpdate = 0;
  const controller = new AbortController();
  const status = document.getElementById('discord-status')!;
  const activities = document.getElementById('discord-activities')!;
  const dot = document.getElementById('discord-dot')!;
  function unavailable() {
    dot.className = 'status-dot';
    status.textContent = 'Estado no disponible · reconectando';
    activities.replaceChildren(
      text(
        'p',
        'La conexión se está recuperando. Mi perfil sigue disponible en Discord.',
        'presence-empty',
      ),
    );
  }
  function render(data: Presence) {
    lastUpdate = Date.now();
    failures = 0;
    const user = data.discord_user;
    document.getElementById('discord-name')!.textContent =
      user.global_name || user.username;
    document.getElementById('discord-handle')!.textContent =
      `${user.username}${user.primary_guild?.tag ? ` · ${user.primary_guild.tag}` : ''}`;
    status.textContent = labels[data.discord_status] || 'Estado desconocido';
    dot.className = `status-dot ${data.discord_status}`;
    if (user.avatar) {
      const avatar = document.createElement('img');
      avatar.alt = `Avatar de ${user.global_name || user.username}`;
      avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`;
      document.getElementById('discord-avatar')!.replaceChildren(avatar);
    }
    const decoration = document.getElementById(
      'discord-decoration',
    ) as HTMLImageElement;
    decoration.hidden = !user.avatar_decoration_data;
    if (user.avatar_decoration_data)
      decoration.src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=160`;
    const custom = data.activities.find((activity) => activity.type === 4);
    const customElement = document.getElementById('discord-custom')!;
    customElement.hidden = !custom;
    customElement.textContent = custom
      ? `${custom.emoji?.name || ''} ${custom.state || ''}`.trim()
      : '';
    activities.replaceChildren();
    const visible =
      data.discord_status === 'offline'
        ? []
        : data.activities.filter((activity) => activity.type !== 4);
    if (!visible.length)
      activities.append(
        text(
          'p',
          data.discord_status === 'offline'
            ? 'Ahora estoy desconectado.'
            : 'Sin una actividad pública en este momento.',
          'presence-empty',
        ),
      );
    visible.forEach((activity) => {
      const card = text('div', '', 'activity');
      card.append(
        text(
          'div',
          `${activity.type === 2 ? 'Escuchando' : activity.type === 0 ? 'Jugando a' : 'En actividad'} ${activity.name}`,
          'activity-label',
        ),
      );
      const content = text('div', '', 'activity-content');
      const imageUrl = assetUrl(activity);
      if (imageUrl) {
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = '';
        image.addEventListener('error', () => image.remove(), { once: true });
        content.append(image);
      }
      const copy = text('div', '', 'activity-text');
      copy.append(
        text('strong', activity.details || activity.name),
        text('p', activity.state || ''),
        text('p', activity.name),
      );
      content.append(copy);
      card.append(content);
      if (activity.timestamps?.start) {
        const progress = text('div', '', 'activity-progress');
        const bar = text('span', '');
        progress.append(bar);
        const timer = text('div', '', 'activity-time');
        timer.dataset.start = String(activity.timestamps.start);
        if (activity.timestamps.end)
          timer.dataset.end = String(activity.timestamps.end);
        timer.append(text('span', '0:00'), text('span', ''));
        card.append(progress, timer);
      }
      if (
        activity.details_url &&
        /^https:\/\/(music\.youtube\.com|open\.spotify\.com)\//.test(
          activity.details_url,
        )
      ) {
        const link = document.createElement('a');
        link.href = activity.details_url;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = 'Escuchar ↗';
        card.append(link);
      }
      activities.append(card);
    });
    tick();
  }
  function time(ms: number) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(seconds / 60);
    return `${minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}` : minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function tick() {
    root!.querySelectorAll<HTMLElement>('.activity-time').forEach((timer) => {
      const start = Number(timer.dataset.start);
      const end = Number(timer.dataset.end);
      const elapsed = Math.max(
        0,
        Math.min(Date.now() - start, end > start ? end - start : Infinity),
      );
      timer.children[0].textContent = time(elapsed);
      timer.children[1].textContent =
        end > start ? time(end - start) : 'transcurridos';
      const bar = timer.previousElementSibling
        ?.firstElementChild as HTMLElement | null;
      if (bar)
        bar.style.width =
          end > start
            ? `${Math.min(100, (elapsed / (end - start)) * 100)}%`
            : '0%';
    });
    if (
      lastUpdate &&
      Date.now() - lastUpdate > 90000 &&
      socket?.readyState !== WebSocket.OPEN
    )
      unavailable();
  }
  async function snapshot() {
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${id}`, {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(12000),
        ]),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('Sin presencia');
      if (!stopped) render(result.data);
    } catch {
      if (!stopped && !lastUpdate) unavailable();
    }
  }
  function connect() {
    if (stopped || document.hidden) return;
    socket = new WebSocket('wss://api.lanyard.rest/socket');
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.op === 1) {
          clearInterval(heartbeat);
          heartbeat = window.setInterval(() => {
            if (socket?.readyState === WebSocket.OPEN)
              socket.send(JSON.stringify({ op: 3 }));
          }, message.d.heartbeat_interval);
          socket?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: id } }));
        } else if (message.op === 0 && message.d?.discord_user)
          render(message.d);
      } catch {
        /* Un mensaje inválido no reemplaza la última presencia válida. */
      }
    });
    socket.addEventListener('close', () => {
      clearInterval(heartbeat);
      if (!stopped && !document.hidden) {
        snapshot();
        retry = window.setTimeout(
          connect,
          Math.min(30000, 2000 * 2 ** failures++),
        );
      }
    });
    socket.addEventListener('error', () => socket?.close());
  }
  document.addEventListener(
    'visibilitychange',
    () => {
      clearTimeout(retry);
      if (document.hidden) {
        socket?.close();
        clearInterval(heartbeat);
      } else {
        snapshot();
        if (!socket || socket.readyState > WebSocket.OPEN) connect();
      }
    },
    { signal: controller.signal },
  );
  const timer = window.setInterval(tick, 1000);
  snapshot();
  connect();
  dispose = () => {
    stopped = true;
    controller.abort();
    clearInterval(timer);
    clearInterval(heartbeat);
    clearTimeout(retry);
    socket?.close();
  };
}
document.addEventListener('astro:page-load', setupPresence);
document.addEventListener('astro:before-swap', () => dispose?.());
