'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/use-api-client';
import { API } from '@/config/api-endpoints';
import { JOB_POLL_INTERVAL_MS, JOB_POLL_MAX_ATTEMPTS } from '@/lib/constants';
import type { JobResult, JobStatus } from '@/types/ui';

interface UseJobPollingOptions {
  jobId: string | null;
  onComplete?: (result: unknown) => void;
  onError?: (error: string) => void;
}

export function useJobPolling({ jobId, onComplete, onError }: UseJobPollingOptions) {
  const { get } = useApiClient();
  const attemptRef = useRef(0);
  const [isCancelled, setIsCancelled] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['job-status', jobId],
    queryFn: () => get<JobResult>(API.JOB_STATUS(jobId!)),
    enabled: !!jobId && !isCancelled,
    refetchInterval: (query) => {
      const status: JobStatus | undefined = (query.state.data as JobResult | undefined)?.status;
      attemptRef.current += 1;
      if (
        status === 'completed' ||
        status === 'error' ||
        attemptRef.current >= JOB_POLL_MAX_ATTEMPTS
      ) {
        return false;
      }
      return JOB_POLL_INTERVAL_MS;
    },
  });

  const resultQuery = useQuery({
    queryKey: ['job-result', jobId],
    queryFn: () => get<unknown>(API.JOB_RESULT(jobId!)),
    enabled: statusQuery.data?.status === 'completed' && !!jobId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (statusQuery.data?.status === 'error' && onError) {
      onError(statusQuery.data.error ?? 'Job fehlgeschlagen');
    }
  }, [statusQuery.data?.status, statusQuery.data?.error, onError]);

  useEffect(() => {
    if (resultQuery.data !== undefined && onComplete) {
      onComplete(resultQuery.data);
    }
  }, [resultQuery.data, onComplete]);

  const cancel = () => setIsCancelled(true);

  return {
    status: statusQuery.data?.status ?? (jobId ? 'queued' : null),
    isRunning:
      statusQuery.data?.status === 'queued' ||
      statusQuery.data?.status === 'running',
    isCompleted: statusQuery.data?.status === 'completed',
    isError: statusQuery.data?.status === 'error',
    result: resultQuery.data,
    cancel,
  };
}
