import 'server-only';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { readMock } from '@/shared/server/mock-db';
import type { CargoesRepository, Repositories } from './types';

export function createMockRepositories(): Repositories {
  const cargoes: CargoesRepository = {
    list(): Cargo[] {
      return readMock('cargoes');
    }
  };

  return { cargoes };
}
