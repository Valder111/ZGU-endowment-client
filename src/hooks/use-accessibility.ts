import { useSyncExternalStore } from 'react';
const preferenceKey = 'zgu-accessible';
const preferenceEvent = 'zgu-accessibility-change';
let memoryPreference = false;
function getSnapshot() {
  try {
    return localStorage.getItem(preferenceKey) === 'true';
  } catch {
    return memoryPreference;
  }
}
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(preferenceEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(preferenceEvent, onChange);
  };
}
const getServerSnapshot = () => false;
export function useAccessibility() {
  const accessible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  function toggleAccessible() {
    memoryPreference = !getSnapshot();
    try {
      localStorage.setItem(preferenceKey, String(memoryPreference));
    } catch {
      /* Keep the in-memory preference if storage is disabled. */
    }
    window.dispatchEvent(new Event(preferenceEvent));
  }
  return { accessible, toggleAccessible };
}
