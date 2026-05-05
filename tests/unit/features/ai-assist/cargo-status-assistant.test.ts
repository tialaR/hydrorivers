import { describe, expect, it } from 'vitest';
import { buildCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-assistant';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

const minimalOpen: Cargo = {
  id: 'c1',
  title: 'T',
  origin: 'O1',
  destination: 'D1',
  volume: '1',
  window: 'w',
  cargoType: 'Seca',
  status: 'open',
  co2Saving: '-1%',
  targetPrice: 'R$ 1',
  ownerId: 'u1'
};

describe('buildCargoStatusAssist', () => {
  it('retorna mock-ai para status conhecido', () => {
    const result = buildCargoStatusAssist(minimalOpen, 'pt-BR');
    expect(result.source).toBe('mock-ai');
    expect(result.summary.length).toBeGreaterThan(10);
    expect(result.nextSteps.length).toBeGreaterThan(0);
  });

  it('acrescenta bloqueio extra quando documentReadiness baixo', () => {
    const cargo = { ...minimalOpen, documentReadiness: 30 };
    const result = buildCargoStatusAssist(cargo, 'pt-BR');
    expect(result.blockers.some((b) => b.includes('30'))).toBe(true);
  });

  it('usa fallback-rule para status fora do mapa i18n', () => {
    const odd = { ...minimalOpen, status: 'custom_unknown' } as unknown as Cargo;
    const result = buildCargoStatusAssist(odd, 'en');
    expect(result.source).toBe('fallback-rule');
    expect(result.confidence).toBe('low');
  });
});
