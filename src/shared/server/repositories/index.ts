import 'server-only';

import { createMockRepositories } from './mock-repositories';
import type { Repositories } from './types';

let cached: Repositories | null = null;

/** Instância única por runtime do servidor (implementação atual = mock em arquivo). */
export function getRepositories(): Repositories {
  cached ??= createMockRepositories();
  return cached;
}

export type { CargoesRepository, Repositories } from './types';
