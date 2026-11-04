import { useRef, useState } from 'react';
import { staffError } from '@/api/staff';

export function useStaffAction() {
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function run(action: () => Promise<void>, success: string) {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setNotice('');
    setError('');
    try {
      await action();
      setNotice(success);
    } catch (error) {
      setError(
        error instanceof Error && error.name === 'FormError'
          ? error.message
          : staffError(error),
      );
    } finally {
      locked.current = false;
      setPending(false);
    }
  }
  return { pending, notice, error, run };
}

export function invalidStaffForm(message: string): never {
  const error = new Error(message);
  error.name = 'FormError';
  throw error;
}
