import { apiRoutes } from '@/shared/routing/api-routes';
import type { Cargo } from '../domain/marketplace.types';

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as { error?: string }).error ?? 'request-failed');
  return payload as T;
}

export async function readCargoes(): Promise<Cargo[]> {
  const response = await fetch(apiRoutes.cargos.collection, { cache: 'no-store' });
  const payload = await parseResponse<{ data?: Cargo[] } | Cargo[]>(response);
  return Array.isArray(payload) ? payload : payload.data ?? [];
}
