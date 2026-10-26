import { renderToString } from 'react-dom/server';
import { App } from '@/App';
import { pages } from '@/routes/registry';
import { resolvePage } from '@/routes/resolve-page';
import { assets } from '@/constants/assets';
import { siteConfig } from '@/configs/site';
export const paths = pages.map((page) => page.path);
export const favicon = assets.favicon;
export function render(pathname: string) {
  const page = resolvePage(pathname);
  const title =
    page?.kind === 'home'
      ? siteConfig.name
      : `${page?.title ?? 'Страница не найдена'} — ${siteConfig.name}`;
  return { html: renderToString(<App pathname={pathname} />), title };
}
