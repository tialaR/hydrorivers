import type { Cargo } from '../domain/marketplace.types';

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as { error?: string }).error ?? 'request-failed');
  return payload as T;
}

export async function readCargoes(): Promise<Cargo[]> {
  const response = await fetch('/api/cargas', { cache: 'no-store' });
  const payload = await parseResponse<{ data?: Cargo[] } | Cargo[]>(response);
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

export async function persistCargo(cargo: Cargo) {
  const response = await fetch('/api/cargas', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(cargo)
  });
  const data = await parseResponse<{ data?: Cargo } | Cargo>(response);
  window.dispatchEvent(new CustomEvent('hydrorivers:mock-changed', { detail: { key: 'cargoes' } }));
  return 'data' in data && data.data ? data.data : data as Cargo;
}
