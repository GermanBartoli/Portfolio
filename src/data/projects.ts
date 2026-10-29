export interface Project {
  slug: string;
  title: string;
  category: 'Extensiones' | 'Web' | 'Software';
  year: number;
  description: string;
  stack: string[];
  image?: string;
  imageNote?: string;
  website?: string;
  featured?: boolean;
}

// Orden editorial: proyectos recientes primero; el archivo conserva el recorrido anterior.
export const projects: Project[] = [
  {
    slug: 'rift-sanctum',
    title: 'Rift Sanctum',
    category: 'Web',
    year: 2026,
    description:
      'Un santuario personal de League of Legends: perfil de invocador, logros y una colección de fondos, íconos y marcos para personalizar su apariencia en el navegador.',
    stack: ['HTML', 'JavaScript', 'Cloudflare'],
    image: '/images/rift-sanctum.png',
    imageNote: 'Captura del perfil personalizable de Rift Sanctum',
    website: 'https://rift-sanctum.pages.dev/',
    featured: true,
  },
  {
    slug: 'forja-del-invocador',
    title: 'Forja del Invocador',
    category: 'Web',
    year: 2026,
    description:
      'Una armería para aprender los objetos de League of Legends: catálogo en cuatro idiomas, filtros, recetas y minijuegos con progreso local.',
    stack: ['HTML', 'JavaScript', 'Cloudflare'],
    image: '/images/forja-del-invocador.png',
    imageNote: 'Captura del sitio Forja del Invocador',
    website: 'https://forja-del-invocador.pages.dev/',
    featured: true,
  },
  {
    slug: 'obs-recording-beep',
    title: 'OBS Recording Beep',
    category: 'Software',
    year: 2026,
    description:
      'Un aviso sonoro para saber cuándo empieza, se pausa y termina una grabación en OBS Studio. Pequeña herramienta, una necesidad concreta.',
    stack: ['Lua', 'OBS Studio', 'Windows'],
    image: '/images/obs.webp',
    featured: true,
  },
  {
    slug: 'MarcoBartoliFit',
    title: 'Marco Bartoli Fit',
    category: 'Web',
    year: 2026,
    description:
      'Un espacio digital para el coaching online: entrenamiento basado en ciencia, videos y una conexión directa con la comunidad.',
    stack: ['JavaScript', 'CSS', 'Cloudflare'],
    image: '/images/marco.webp',
    website: 'https://marcobartolifit.pages.dev',
    featured: true,
  },
  {
    slug: 'crecer-coach-laboral',
    title: 'CRecer · Celeste Rivero',
    category: 'Web',
    year: 2026,
    description:
      'Un espacio de coaching laboral para conocer a Celeste, explorar sus servicios y descubrir sus publicaciones de Instagram y LinkedIn.',
    stack: ['HTML', 'JavaScript', 'Cloudflare'],
    image: '/images/crecer.png',
    imageNote: 'Captura del sitio CRecer',
    website: 'https://crecer-coach-laboral.pages.dev',
    featured: true,
  },
  {
    slug: 'CupidoDigitttal',
    title: 'Cupido Digitttal',
    category: 'Web',
    year: 2026,
    description:
      'El sitio de un estudio creativo de Córdoba. Identidad, contenido y estrategia en una experiencia visual con personalidad.',
    stack: ['HTML', 'JavaScript', 'Cloudflare'],
    image: '/images/cupido.webp',
    website: 'https://cupido-digitttal.pages.dev',
    featured: true,
  },
  {
    slug: 'Discord-Rich-Presence',
    title: 'Discord Rich Presence',
    category: 'Extensiones',
    year: 2026,
    description:
      'YouTube Music en tu perfil de Discord. Extensión de Chrome con controles de privacidad y un conector local para Windows.',
    stack: ['JavaScript', 'Node.js', '.NET'],
    image: '/images/discord.webp',
    imageNote: 'Identidad de la extensión',
    featured: true,
  },
  {
    slug: 'aqw-wiki-item-preview',
    title: 'AQW Wiki Item Preview',
    category: 'Extensiones',
    year: 2026,
    description:
      'Descubrir objetos sin abrir decenas de pestañas. Vistas previas y miniaturas directamente en las tablas de AQW Wiki.',
    stack: ['JavaScript', 'Chrome MV3'],
    image: '/images/aqw.webp',
    featured: true,
  },
  {
    slug: 'premid-youtube-music-sync',
    title: 'YouTube Music Sync',
    category: 'Extensiones',
    year: 2026,
    description:
      'Una actividad comunitaria de PreMiD que mantiene canción, pausa y tiempos de YouTube Music sincronizados con Discord.',
    stack: ['TypeScript', 'PreMiD'],
    image: '/images/premid.webp',
    imageNote: 'Interfaz de PreMiD utilizada como referencia',
    featured: true,
  },
  {
    slug: 'gallerypro',
    title: 'GalleryPRO',
    category: 'Extensiones',
    year: 2026,
    description:
      'Más claridad para tu biblioteca de Google Fotos. Encontrá fotos sin álbum y recorré una galería con filtros, sin modificar tus archivos.',
    stack: ['JavaScript', 'Chrome MV3'],
    image: '/images/gallery.webp',
    imageNote: 'Identidad visual de GalleryPRO',
    featured: true,
  },
  {
    slug: 'SqlBulkCopy-Adapter-CSharp',
    title: 'SqlBulkCopy Adapter',
    category: 'Software',
    year: 2024,
    description:
      'Proyecto en C# sobre SQLDataAdapter y SqlBulkCopy, acompañado por una comparación en video.',
    stack: ['C#', 'SQL Server', 'SQLDataAdapter'],
  },
  {
    slug: 'Bootstrap4-Course-Platzi',
    title: 'Bootstrap · Platzi',
    category: 'Web',
    year: 2022,
    description:
      'Proyecto de aprendizaje de interfaces web y diseño adaptable con Bootstrap.',
    stack: ['HTML', 'CSS', 'Bootstrap'],
    website: 'https://germanbartoli.github.io/Bootstrap4-Course-Platzi/',
  },
  {
    slug: 'Library-CSharp-MySQL',
    title: 'Library',
    category: 'Software',
    year: 2022,
    description:
      'Aplicación web de biblioteca construida con ASP.NET 6, Razor MVC y MySQL.',
    stack: ['C#', 'ASP.NET', 'MySQL'],
  },
  {
    slug: 'Academic-System-DevSpirit',
    title: 'Academic System',
    category: 'Software',
    year: 2022,
    description:
      'Sistema académico web desarrollado con C#, ASP.NET MVC y MySQL.',
    stack: ['C#', '.NET 6', 'MySQL'],
    website: 'https://sistemasisi.com/',
  },
  {
    slug: 'Final-Project-TUP-UTN',
    title: 'Proyecto final · UTN',
    category: 'Software',
    year: 2022,
    description:
      'Aplicación de escritorio realizada como proyecto final de la Tecnicatura Universitaria en Programación.',
    stack: ['Java', 'SQL Server'],
  },
  {
    slug: 'UTN-Academy',
    title: 'UTN Academy',
    category: 'Software',
    year: 2022,
    description:
      'Aplicación web de academia desarrollada con Java y SQL Server.',
    stack: ['Java', 'SQL Server'],
  },
  {
    slug: 'Bitsion-Fictitious-SA',
    title: 'Empresa Ficticia S.A.',
    category: 'Software',
    year: 2022,
    description:
      'Proyecto del portfolio original. Se conserva como parte de mi recorrido de desarrollo.',
    stack: ['Proyecto de archivo'],
  },
  {
    slug: 'Da-Vinci-Code-Manager',
    title: 'Da Vinci Code Manager',
    category: 'Software',
    year: 2022,
    description:
      'Proyecto de gestión de museo del portfolio original. Una pieza de mis primeros trabajos.',
    stack: ['Proyecto de archivo'],
  },
];
