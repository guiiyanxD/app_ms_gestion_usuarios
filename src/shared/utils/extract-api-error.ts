import axios from 'axios';

export function extractApiError(err: unknown, fallback = 'Error desconocido'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (data) {
      if (typeof data.message === 'string' && data.message) return data.message;
      if (Array.isArray(data.message)) return (data.message as string[]).join(', ');
      if (typeof data.error === 'string' && data.error) return data.error;
      if (typeof data === 'string') return data;
    }
    return `HTTP ${err.response?.status ?? '?'}: ${err.message}`;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
