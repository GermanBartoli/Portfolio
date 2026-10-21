import { projects } from '../data/projects';
export function GET() {
  const urls = ['/', ...projects.map(project => `/proyectos/${project.slug}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>https://germanbartoli.pages.dev${url}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
}
