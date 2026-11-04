import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { staffError, type StaffRequest } from '@/api/staff';
import type { RequestParams } from '@/api/generated/http-client';

export function useStaffResource<T>(
  request: StaffRequest,
  load: (params: RequestParams) => Promise<AxiosResponse<T>>,
  enabled = true,
) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    load: typeof load;
    revision: number;
    request: StaffRequest;
    data?: T;
    error?: string;
  }>();

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const key = { load, revision, request };
    request(load({ signal: controller.signal })).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ ...key, data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setResult({ ...key, error: staffError(error) });
      },
    );
    return () => controller.abort();
  }, [request, load, revision, enabled]);

  const current =
    enabled &&
    result?.load === load &&
    result.revision === revision &&
    result.request === request
      ? result
      : undefined;
  return {
    data: current?.data,
    error: current?.error,
    loading: enabled && !current,
    revision,
    reload: () => setRevision((value) => value + 1),
  };
}
