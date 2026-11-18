import { profile } from './profile';

export const paginas = [
  ['', 'Portada'], ['fotos', 'Fotos'], ['juegos', 'Juegos'], ['musica', 'Música'],
  ['taller', 'Taller'], ['consejos', 'Consejos'], ['pruebas', 'Pruebas'],
  ['recorrido', 'Recorrido'], ['links', 'Mis links'],
];
export const ruta = (id: string) => id ? `/sobre-mi/${id}/` : '/sobre-mi/';

export const enlaces = [
  ['Portfolio', 'germanbartoli.pages.dev', 'https://germanbartoli.pages.dev'],
  ['Instagram', '@germanbartoli497', 'https://instagram.com/germanbartoli497'],
  ['X / Twitter', '@germanbartoli49', 'https://x.com/germanbartoli49'],
  ['GitHub', 'GermanBartoli', profile.github],
  ['YouTube Music', '@germanbartoli497', 'https://music.youtube.com/@germanbartoli497'],
  ['Steam', 'KillerBiss', 'https://steamcommunity.com/id/KillerBiss'],
  ['League of Legends', 'KillerBiss #2013 · LAS', 'https://op.gg/summoners/las/KillerBiss-2013'],
  ['AdventureQuest Worlds', 'marcoss13', 'https://aq.com/character.asp?id=marcoss13'],
  ['YouTube', '@germanbartoli497', 'https://www.youtube.com/@germanbartoli497'],
  ['Spotify', 'Mi perfil', 'https://open.spotify.com/user/n3uka3y540ej51v4l2wkhxgzn'],
  ['Spotify', 'Mi playlist para programar', 'https://open.spotify.com/playlist/5zy0EhRvYm0LafUibvCxOo'],
  ['LinkedIn', 'Germán Bartoli', profile.linkedin],
  ['WakaTime', 'Mi actividad', profile.wakatime],
  ['Platzi', 'Mi formación', profile.platzi],
  ['Discord', 'Mi perfil', 'https://discord.com/users/' + profile.discordId],
  ['Lichess', 'Marcoss13', 'https://lichess.org/@/Marcoss13'],
  ['Chess.com', 'Marcoss13', 'https://www.chess.com/member/marcoss13'],
];

export const retratos = [
  ['/images/profile/german-portfolio.jpg', 'La foto de mi portfolio anterior'],
  ['/images/profile/german-codex.jpeg', 'Mi retrato en blanco y negro'],
];
export const consejos = [
  ['Guardá el original', 'Si vas a recortar una foto para una portada, guardá una copia en su resolución original. Después podés volver a encuadrarla sin perder detalle.'],
  ['Probalo como lo usarías', 'Abrí la página desde el celular, recorré los botones con el teclado y compartí un enlace directo a la parte que querés mostrar.'],
  ['Empezá por algo que repetís', 'Una acción chiquita que hacés todos los días puede ser un buen primer proyecto. Mi extensión de AQW nació alrededor de algo así: consultar objetos en la wiki.'],
  ['Dejá una forma de volver', 'Antes de tocar una configuración, anotá el valor anterior. Cuando pruebes el cambio vas a poder comparar y volver al punto de partida.'],
];
export const preguntas = [
  ['¿Qué nombre uso en Steam?', ['KillerBiss', 'GermanBartoli', 'marcoss13'], 'KillerBiss'],
  ['¿Dónde estudié programación?', ['Platzi English Academy', 'UTN', 'DevSpirit'], 'UTN'],
  ['¿Qué proyecto se asoma a la wiki de un juego?', ['WinGer', 'Trello Focus', 'AQW Wiki Item Preview'], 'AQW Wiki Item Preview'],
  ['¿En qué región juego al LoL?', ['EUW', 'LAS', 'NA'], 'LAS'],
  ['¿Qué uso para compartir mi actividad de código?', ['WakaTime', 'Steam', 'OP.GG'], 'WakaTime'],
  ['¿Cómo se llama mi personaje de AQW?', ['KillerBiss', 'marcoss13', 'GermanBartoli'], 'marcoss13'],
] as const;
