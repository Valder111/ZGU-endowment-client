import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from '@/App';
import { localPath } from '@/utils/paths';
import { assets } from '@/constants/assets';
import { resolvePage } from '@/routes/resolve-page';
import { siteConfig } from '@/configs/site';
import '@/assets/styles/index.css';
document.documentElement.classList.remove('no-js');
const root = document.getElementById('root');
if (!root) throw new Error('Root element is missing');
const pathname = localPath(window.location.pathname);
const page = resolvePage(pathname);
document.title =
  page?.kind === 'home'
    ? siteConfig.name
    : `${page?.title ?? 'Страница не найдена'} – ${siteConfig.name}`;
const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (favicon) favicon.href = assets.favicon;
const application = (
  <StrictMode>
    <App pathname={pathname} />
  </StrictMode>
);
if (root.hasChildNodes()) {
  hydrateRoot(root, application);
} else {
  // The preview mounts into an empty page, so fragment targets only exist after rendering.
  flushSync(() => createRoot(root).render(application));
  const target = document.getElementById(window.location.hash.slice(1));
  target?.scrollIntoView({ behavior: 'instant' });
}
