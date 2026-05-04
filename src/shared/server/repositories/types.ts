import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

/** Contrato de leitura de cargas; implementação mock usa `.mock-data` via `mock-db`. */
export type CargoesRepository = {
  list(): Cargo[];
};

export type Repositories = {
  cargoes: CargoesRepository;
};
