import 'server-only';

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defaultUsers } from '@/features/auth/data/auth.mock';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { cargoes, negotiations, trackingEvents, vessels } from '@/features/marketplace/data/marketplace.mock';
import { getMockScenario, mockScenarioIds, type MockScenarioId } from '@/shared/server/mock-scenarios';
import type { Cargo, Negotiation, TrackingEvent, Vessel } from '@/features/marketplace/domain/marketplace.types';

type MockData = {
  users: HydroUser[];
  cargoes: Cargo[];
  vessels: Vessel[];
  negotiations: Negotiation[];
  trackingEvents: TrackingEvent[];
};

const dataDir = path.join(process.cwd(), '.mock-data');
const seeds: MockData = { users: defaultUsers, cargoes, vessels, negotiations, trackingEvents };
const scenarioFile = path.join(dataDir, 'scenario.json');

function ensureDir() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
}

function fileFor<K extends keyof MockData>(key: K) {
  return path.join(dataDir, `${key}.json`);
}

export function getActiveMockScenario(): MockScenarioId | 'base' {
  ensureDir();
  if (!existsSync(scenarioFile)) return 'base';

  try {
    const stored = JSON.parse(readFileSync(scenarioFile, 'utf8')) as { scenario?: string };
    return mockScenarioIds.includes(stored.scenario as MockScenarioId) ? stored.scenario as MockScenarioId : 'base';
  } catch {
    return 'base';
  }
}

export function resetMockScenario(scenario?: string) {
  ensureDir();
  const data = getMockScenario(scenario);
  const activeScenario = mockScenarioIds.includes(scenario as MockScenarioId) ? scenario as MockScenarioId : 'base';

  (Object.keys(data) as Array<keyof MockData>).forEach((key) => {
    writeFileSync(fileFor(key), JSON.stringify(data[key], null, 2));
  });

  writeFileSync(scenarioFile, JSON.stringify({ scenario: activeScenario, updatedAt: new Date().toISOString() }, null, 2));

  return { scenario: activeScenario, data };
}


function mergeSeededArray<T extends { id: string }>(stored: T[], seeded: T[]) {
  const ids = new Set(stored.map((item) => item.id));
  return [...stored, ...seeded.filter((item) => !ids.has(item.id))];
}

export function readMock<K extends keyof MockData>(key: K): MockData[K] {
  ensureDir();
  const file = fileFor(key);
  if (!existsSync(file)) {
    writeFileSync(file, JSON.stringify(seeds[key], null, 2));
    return seeds[key];
  }
  try {
    const stored = JSON.parse(readFileSync(file, 'utf8')) as MockData[K];

    if (Array.isArray(stored) && Array.isArray(seeds[key])) {
      const merged = mergeSeededArray(
        stored as Array<{ id: string }>,
        seeds[key] as Array<{ id: string }>
      ) as MockData[K];

      if ((merged as Array<{ id: string }>).length !== (stored as Array<{ id: string }>).length) {
        writeFileSync(file, JSON.stringify(merged, null, 2));
      }

      return merged;
    }

    return stored;
  } catch {
    writeFileSync(file, JSON.stringify(seeds[key], null, 2));
    return seeds[key];
  }
}

export function writeMock<K extends keyof MockData>(key: K, value: MockData[K]) {
  ensureDir();
  writeFileSync(fileFor(key), JSON.stringify(value, null, 2));
}

export function upsertUser(user: HydroUser) {
  const users = readMock('users');
  const emailNorm = user.email.toLowerCase();
  const phone = user.phoneE164?.replace(/\D/g, '') ?? '';
  const next = [
    user,
    ...users.filter((item) => {
      if (item.id === user.id) return false;
      if (item.email.toLowerCase() === emailNorm) return false;
      if (phone && item.phoneE164?.replace(/\D/g, '') === phone) return false;
      return true;
    })
  ];
  writeMock('users', next);
  return user;
}

export function upsertCargo(cargo: Cargo) {
  const list = readMock('cargoes');
  const next = [cargo, ...list.filter((item) => item.id !== cargo.id)];
  writeMock('cargoes', next);
  return cargo;
}
