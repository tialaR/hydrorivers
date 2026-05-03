import { mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';

const originalCwd = process.cwd();
const tempDirs: string[] = [];

async function importMockDbInTempDir() {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'hydrorivers-mock-db-'));
  tempDirs.push(tempDir);
  process.chdir(tempDir);
  vi.resetModules();
  return import('@/shared/server/mock-db');
}

afterEach(() => {
  process.chdir(originalCwd);
});

describe('shared/server/mock-db upserts', () => {
  it('upsertUser substitui por id e evita duplicidade por email', async () => {
    const mockDb = await importMockDbInTempDir();

    mockDb.writeMock('users', [
      {
        id: 'u-1',
        name: 'Tiala Rocha',
        email: 'teste-upsert@hydrorivers.com',
        company: 'Cooperativa Açaí Norte',
        role: 'shipper',
        approved: true,
        passwordHash: 'hash-1'
      } as any,
      {
        id: 'u-2',
        name: 'João Navegante',
        email: 'joao@naveganorte.com',
        company: 'Navega Norte',
        role: 'carrier',
        approved: true,
        passwordHash: 'hash-2'
      } as any
    ]);

    mockDb.upsertUser({
      id: 'u-3',
      name: 'Tiala Atualizada',
      email: 'TESTE-UPSERT@hydrorivers.com',
      company: 'Cooperativa Açaí Norte',
      role: 'shipper',
      approved: true,
      passwordHash: 'hash-3'
    } as any);

    const users = mockDb.readMock('users') as any[];
    const matches = users.filter((user) => user.email.toLowerCase() === 'teste-upsert@hydrorivers.com');

    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('u-3');
    expect(users[0].id).toBe('u-3');
  });

  it('upsertCargo substitui por id sem duplicar', async () => {
    const mockDb = await importMockDbInTempDir();

    mockDb.writeMock('cargoes', [
      {
        id: 'cargo-1',
        title: 'Polpa de açaí',
        origin: 'Belém',
        destination: 'Santarém',
        cargoType: 'Refrigerada',
        status: 'open'
      } as any,
      {
        id: 'cargo-2',
        title: 'Farinha',
        origin: 'Manaus',
        destination: 'Belém',
        cargoType: 'Seca',
        status: 'open'
      } as any
    ]);

    mockDb.upsertCargo({
      id: 'cargo-1',
      title: 'Polpa de açaí - atualizada',
      origin: 'Belém',
      destination: 'Santarém',
      cargoType: 'Refrigerada',
      status: 'bidding'
    } as any);

    const cargoes = mockDb.readMock('cargoes') as any[];
    const matches = cargoes.filter((cargo) => cargo.id === 'cargo-1');

    expect(matches).toHaveLength(1);
    expect(matches[0].status).toBe('bidding');
    expect(cargoes[0].id).toBe('cargo-1');
  });
});

afterEach(() => {
  while (tempDirs.length) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});
