import { useEffect } from 'react';
import { sitePath } from '@/utils/paths';

export function useTeapotShortcut(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;
    function cancel() {
      window.clearTimeout(timer);
      timer = undefined;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key !== 'Enter' ||
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (event.target instanceof Element &&
          event.target.closest(
            'a, button, input, textarea, select, summary, [contenteditable], [role="dialog"], [role="button"]',
          ))
      )
        return;
      if (event.repeat || timer !== undefined) return;
      timer = window.setTimeout(
        () => window.location.assign(sitePath('/418/')),
        6700,
      );
    }
    function onKeyUp(event: KeyboardEvent) {
      if (event.key === 'Enter') cancel();
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', cancel);
    document.addEventListener('visibilitychange', cancel);
    document.addEventListener('focusin', cancel);
    return () => {
      cancel();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', cancel);
      document.removeEventListener('visibilitychange', cancel);
      document.removeEventListener('focusin', cancel);
    };
  }, [enabled]);
}
