type Valores = Record<string, number>;
type Desglose = Record<string, Valores>;
type Dia = { uso?: Desglose; mensajes?: Desglose; complementos?: Valores; skills?: Valores };
type Periodo = { inicio: string; fin: string; minutos: number; usado: number | null; completo: boolean; desgloses: Desglose };
type Historial = { desde: string; hasta: string; dias: Record<string, Dia>; periodos: Periodo[]; tokens: { inicio: string; hasta: string; dias: [number, number][] } };
type Punto = { fecha: string; valores: Valores; disponible: boolean };
const diaMs = 86400000;
const marca = (fecha: string) => Date.parse(fecha + 'T00:00:00Z');
const iso = (ms: number) => new Date(ms).toISOString().slice(0,10);
const fechaCorta = (fecha: string) => new Date(marca(fecha)).toLocaleDateString('es-AR',{day:'numeric',month:'short',timeZone:'UTC'});
const numero = (n: number) => n.toLocaleString('es-AR', {maximumFractionDigits: 1});
const porcentaje = (n: number) => n > 0 && n < .1 ? '<0,1 %' : numero(n) + ' %';
const colores = ['#a8d789','#6ab9fc','#efa45e','#d696d1','#ae9cfc','#58cfbd','#f5c562','#9fbbc2','#e58288','#c2bc90'];
const suma = (v: Valores) => Object.values(v).reduce((a,b) => a+b, 0);
function elemento<K extends keyof HTMLElementTagNameMap>(nombre: K, texto?: string) {
  const nodo = document.createElement(nombre);
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
}
function figura<K extends keyof SVGElementTagNameMap>(nombre: K, attrs: Record<string,string|number>) {
  const nodo = document.createElementNS('http://www.w3.org/2000/svg',nombre);
  for (const [k,v] of Object.entries(attrs)) nodo.setAttribute(k, String(v));
  return nodo;
}
function dibujar(panel: HTMLElement, puntos: Punto[], tipo: string, elegida?: string) {
  const lienzo = panel.querySelector<HTMLElement>('[data-lienzo]')!;
  const leyenda = panel.querySelector<HTMLElement>('[data-leyenda]')!;
  const lectura = panel.querySelector<HTMLElement>('[data-lectura]')!;
  const total = panel.querySelector<HTMLElement>('[data-total]')!;
  const acumulados: Valores = {};
  for (const p of puntos) for (const [k,n] of Object.entries(p.valores)) acumulados[k] = (acumulados[k] ?? 0) + n;
  const claves = Object.keys(acumulados).filter(k => acumulados[k] > 0).sort((a,b) => acumulados[b]-acumulados[a]);
  const global = suma(acumulados);
  const esUso = tipo === 'uso';
  const formato = (n: number) => esUso ? porcentaje(global ? n / global * 100 : 0) : numero(n);
  total.textContent = esUso ? (claves.length ? formato(acumulados[claves[0]]) + ' · ' + claves[0] : 'Sin registros') : numero(global);
  let activa: string | null = null;
  let indice = elegida ? puntos.findIndex(p => p.fecha === elegida) : puntos.length - 1;
  if (indice < 0) indice = puntos.length - 1;
  const controles = new Map<string,HTMLButtonElement>();
  leyenda.replaceChildren();
  claves.forEach((k,i) => {
    const boton = elemento('button', k); boton.type = 'button';
    boton.style.setProperty('--serie', colores[i % colores.length]);
    boton.title = 'Aislar o volver a mostrar todas las series';
    boton.onclick = () => { activa = activa === k ? null : k; trazar(); };
    controles.set(k,boton); leyenda.append(boton);
  });
  function trazar() {
    const visibles = activa ? [activa] : claves;
    for (const [k,b] of controles) b.setAttribute('aria-pressed', String(visibles.includes(k)));
    const svg = figura('svg',{viewBox:'0 0 600 150',preserveAspectRatio:'none',tabindex:0,role:'slider',
      'aria-label':'Explorar días de ' + panel.querySelector('h2')!.textContent + ' con las flechas',
      'aria-valuemin':1,'aria-valuemax':puntos.length});
    const ancho = 600 / puntos.length;
    const x = (i: number) => ancho * (i + .5);
    const barras = esUso || tipo === 'tokens';
    const maximo = Math.max(1e-12,...puntos.map(p => {
      const valores = visibles.map(k => p.valores[k] ?? 0);
      return barras ? valores.reduce((a,b)=>a+b,0) : Math.max(0,...valores);
    }));
    const y = (n: number) => 145 - n / maximo * 133;
    for (const nivel of [0,.5,1]) svg.append(figura('line',{x1:0,x2:600,y1:y(maximo*nivel),y2:y(maximo*nivel),stroke:'#363c34','stroke-width':1}));
    const base = puntos.map(() => 0);
    for (const k of visibles) {
      const color = colores[claves.indexOf(k) % colores.length];
      if (barras) {
        puntos.forEach((p,i) => {
          const n = p.valores[k] ?? 0;
          if (n > 0) svg.append(figura('rect',{x:x(i)-ancho*.34,y:y(base[i]+n),width:ancho*.68,height:n/maximo*133,fill:color,rx:Math.min(2,ancho*.15)}));
          base[i] += n;
        });
      } else {
        const linea = puntos.map((p,i) => x(i) + ',' + y(p.valores[k] ?? 0)).join(' ');
        svg.append(figura('polyline',{points:linea,fill:'none',stroke:color,'stroke-width':2,'vector-effect':'non-scaling-stroke'}));
        if (puntos.length <= 7) puntos.forEach((p,i) => svg.append(figura('circle',{cx:x(i),cy:y(p.valores[k] ?? 0),r:2.5,fill:color})));
      }
    }
    const cursor = figura('line',{x1:0,x2:0,y1:5,y2:145,stroke:'#e4e8db','stroke-dasharray':'3 4',opacity:.7});
    svg.append(cursor);
    function seleccionar(i: number) {
      indice = Math.max(0,Math.min(puntos.length-1,i));
      const p = puntos[indice];
      cursor.setAttribute('x1',String(x(indice))); cursor.setAttribute('x2',String(x(indice)));
      const detalles = visibles.filter(k => p.valores[k] > 0).map(k => k + ' ' + formato(p.valores[k]));
      const valor = detalles.join(' · ') || (p.disponible ? 'Sin consumo registrado' : 'Sin datos informados');
      lectura.textContent = fechaCorta(p.fecha) + ' ' + p.fecha.slice(0,4) + ' · ' + valor;
      svg.setAttribute('aria-valuenow', String(indice + 1)); svg.setAttribute('aria-valuetext', lectura.textContent);
    }
    const apuntar = (e: PointerEvent) => { const rect = svg.getBoundingClientRect(); seleccionar(Math.floor((e.clientX-rect.left)/rect.width*puntos.length)); };
    svg.onpointermove = apuntar; svg.onpointerdown = apuntar;
    svg.onkeydown = e => {
      const ir: Record<string,number> = { ArrowLeft: indice-1, ArrowDown: indice-1, ArrowRight: indice+1, ArrowUp: indice+1, Home: 0, End: puntos.length-1 };
      if (Object.hasOwn(ir,e.key)) { e.preventDefault(); seleccionar(ir[e.key]); }
    };
    const ejes = elemento('div'); ejes.className = 'ejes-analitica';
    ejes.append(elemento('span',fechaCorta(puntos[0].fecha)), elemento('span',global ? 'Escala 0 – ' + formato(maximo) : 'Sin actividad registrada'), elemento('span',fechaCorta(puntos.at(-1)!.fecha)));
    lienzo.replaceChildren(svg,ejes); seleccionar(indice);
  }
  trazar();
}
class AnaliticaCodex extends HTMLElement {
  connectedCallback() {
    const datos: Historial = JSON.parse(this.querySelector('script')!.textContent!);
    const hasta = this.querySelector<HTMLInputElement>('[data-hasta]')!;
    const solicitada = new URLSearchParams(location.search).get('dia');
    if (solicitada && /^\d{4}-\d{2}-\d{2}$/.test(solicitada) && solicitada >= datos.desde && solicitada <= datos.hasta && Number.isFinite(marca(solicitada)) && iso(marca(solicitada)) === solicitada) hasta.value = solicitada;
    const tokens = new Map(datos.tokens.dias);
    const ventana = this.querySelector<HTMLSelectElement>('[data-ventana]')!;
    const dimension = this.querySelector<HTMLSelectElement>('[data-dimension]')!;
    let rango = 7;
    const actualizar = () => {
      if (!hasta.value || !hasta.validity.valid) return;
      const fin = marca(hasta.value);
      const inicio = rango ? Math.max(marca(datos.desde),fin-(rango-1)*diaMs) : marca(datos.desde);
      const fechas = Array.from({length:1+(fin-inicio)/diaMs},(_,i)=>iso(inicio+i*diaMs));
      this.querySelectorAll<HTMLElement>('[data-grafico]').forEach(panel => {
        const tipo = panel.dataset.grafico!;
        const selector = panel.querySelector('select');
        const pintar = () => {
          const clave = selector?.value ?? '';
          const puntos = fechas.map(fecha => {
            const d = datos.dias[fecha];
            if (tipo === 'tokens') {
              const indice = (marca(fecha)-marca(datos.tokens.inicio))/diaMs;
              return { fecha, disponible: fecha <= datos.tokens.hasta && indice >= 0, valores: { Tokens: Math.round((tokens.get(indice) ?? 0)*1e6) } };
            }
            const valores = tipo === 'herramientas' ? d?.[clave as 'complementos'|'skills'] : d?.[tipo as 'uso'|'mensajes']?.[clave];
            return { fecha, disponible: valores !== undefined, valores: valores ?? {} };
          });
          dibujar(panel,puntos,tipo,hasta.value);
        };
        if (selector) selector.onchange = pintar;
        pintar();
      });
      const pintarPlan = () => {
        const lista = this.querySelector<HTMLElement>('[data-periodos]')!;
        lista.replaceChildren();
        const periodos = datos.periodos.filter(p => p.minutos === Number(ventana.value) && Date.parse(p.inicio) < fin + diaMs && Date.parse(p.fin) > inicio);
        for (const p of periodos) {
          const detalle = elemento('details');
          const formatoFecha = (v: string) => new Date(v).toLocaleString('es-AR',{day:'numeric',month:'short',year:'numeric',...(p.minutos===300 ? {hour:'2-digit',minute:'2-digit'} as const : {}),timeZone:'UTC'});
          const cab = elemento('summary',formatoFecha(p.inicio)+' – '+formatoFecha(p.fin));
          cab.append(elemento('strong',p.usado === null ? 'Sin datos' : porcentaje(p.usado))); detalle.append(cab);
          if (!p.completo) detalle.append(elemento('p','Cobertura parcial del período.'));
          const filas = Object.entries(p.desgloses[dimension.value] ?? {}).sort((a,b)=>b[1]-a[1]);
          const dl = elemento('dl');
          for (const [nombre,n] of filas) { const fila = elemento('div'); fila.append(elemento('dt',nombre),elemento('dd',porcentaje(n))); dl.append(fila); }
          detalle.append(filas.length ? dl : elemento('p','Sin desglose informado.')); lista.append(detalle);
        }
        if (!periodos.length) lista.append(elemento('p','Sin períodos informados en estas fechas.'));
      };
      ventana.onchange = pintarPlan; dimension.onchange = pintarPlan; pintarPlan();
    };
    const botones = this.querySelectorAll<HTMLButtonElement>('[data-rango]');
    for (const boton of botones) boton.onclick = () => {
      rango = Number(boton.dataset.rango);
      botones.forEach(b => b.setAttribute('aria-pressed',String(b === boton))); actualizar();
    };
    hasta.onchange = actualizar; actualizar();
  }
}
if (!customElements.get('codex-analitica')) customElements.define('codex-analitica',AnaliticaCodex);
