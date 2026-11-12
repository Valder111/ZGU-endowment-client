import { useState, useSyncExternalStore } from 'react';
import { SiteLink } from '@/components/elements/site-link';
import { Button } from '@/components/ui/button';
import { legalDocument } from '@/constants/legal';

const storageKey = 'zgu-cookie-notice';
const privacy = legalDocument('privacy');

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

function shouldShowNotice() {
  try {
    return localStorage.getItem(storageKey) !== 'acknowledged';
  } catch {
    return true;
  }
}

const serverSnapshot = () => false;

export function CookieNotice() {
  const showNotice = useSyncExternalStore(
    subscribe,
    shouldShowNotice,
    serverSnapshot,
  );
  const [acknowledged, setAcknowledged] = useState(false);

  if (!showNotice || acknowledged) return null;

  function acknowledge() {
    try {
      localStorage.setItem(storageKey, 'acknowledged');
    } catch {
      // The notice can still be dismissed when browser storage is unavailable.
    }
    setAcknowledged(true);
  }

  return (
    <section className="cookie-notice" aria-labelledby="cookie-notice-title">
      <h2 id="cookie-notice-title">Файлы cookie</h2>
      <p>
        Сайт использует файлы cookie и локальное хранилище для работы и
        сохранения настроек.
      </p>
      <SiteLink href={privacy.path}>{privacy.title}</SiteLink>
      <Button variant="brand" onClick={acknowledge}>
        ОК
      </Button>
    </section>
  );
}
