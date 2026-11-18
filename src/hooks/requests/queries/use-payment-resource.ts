import { useEffect, useState } from 'react';

type Loader<T> = (signal: AbortSignal) => Promise<T>;

export function usePaymentResource<T>(
  load: Loader<T>,
  enabled: boolean,
  pollMs: number,
  stop?: (value: T) => boolean,
) {
  const [revision, setRevision] = useState(0);
  const [snapshot, setSnapshot] = useState<{
    load: Loader<T>;
    revision: number;
    data?: T;
    error?: unknown;
  }>();

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    let finished = false;

    async function refresh() {
      if (running || finished || controller.signal.aborted) return;
      clearTimeout(timer);
      running = true;
      try {
        const data = await load(controller.signal);
        if (!controller.signal.aborted) {
          finished = stop?.(data) ?? false;
          setSnapshot({ load, revision, data });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setSnapshot((previous) => ({
            load,
            revision,
            data: previous?.load === load ? previous.data : undefined,
            error,
          }));
        }
      } finally {
        running = false;
        if (!finished && !controller.signal.aborted && !document.hidden)
          timer = setTimeout(refreshVisible, pollMs);
      }
    }

    function refreshVisible() {
      if (document.hidden) clearTimeout(timer);
      else void refresh();
    }

    refreshVisible();
    window.addEventListener('focus', refreshVisible);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      controller.abort();
      clearTimeout(timer);
      window.removeEventListener('focus', refreshVisible);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [load, enabled, pollMs, revision, stop]);

  const current = enabled && snapshot?.load === load ? snapshot : undefined;
  return {
    data: current?.data,
    error: current?.revision === revision ? current?.error : undefined,
    loading: enabled && current?.revision !== revision,
    refresh: () => setRevision((value) => value + 1),
  };
}
