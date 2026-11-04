import { useEffect, useState } from 'react';
import { staffError, type StaffRequest } from '@/api/staff';

export function useStaffResource<T>(
  request: StaffRequest,
  path: string | null,
) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<
    | {
        path: string;
        revision: number;
        request: StaffRequest;
        data?: T;
        error?: string;
      }
    | undefined
  >();

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    request<T>(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted)
          setResult({ path, revision, request, data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setResult({ path, revision, request, error: staffError(error) });
      },
    );
    return () => controller.abort();
  }, [request, path, revision]);

  const current =
    result?.path === path &&
    result.revision === revision &&
    result.request === request
      ? result
      : undefined;
  return {
    data: current?.data,
    error: current?.error,
    loading: Boolean(path && !current),
    revision,
    reload: () => setRevision((value) => value + 1),
  };
}
