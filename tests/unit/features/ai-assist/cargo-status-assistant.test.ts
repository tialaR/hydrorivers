import { describe, expect, it } from 'vitest';
import { buildCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-assistant';
import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';

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
  it('retorna mock-ai para status conhecido com heading/explanation', () => {
    const result = buildCargoStatusAssist(minimalOpen, 'pt-BR');
    expect(result.source).toBe('mock-ai');
    expect(result.heading).toBeTruthy();
    expect(result.summary.length).toBeGreaterThan(10);
    expect(result.explanation).toBeTruthy();
    expect(result.nextSteps.length).toBeGreaterThan(0);
    expect(Array.isArray(result.attentionPoints)).toBe(true);
  });

  it('acrescenta bloqueio extra quando documentReadiness baixo', () => {
    const cargo = { ...minimalOpen, documentReadiness: 30 };
    const result = buildCargoStatusAssist(cargo, 'pt-BR');
    expect(result.blockers.some((b) => b.includes('30'))).toBe(true);
    expect((result.attentionPoints ?? []).some((item) => item.includes('30'))).toBe(true);
  });

  it('usa fallback-rule para status fora do mapa i18n', () => {
    const odd = { ...minimalOpen, status: 'custom_unknown' } as unknown as Cargo;
    const result = buildCargoStatusAssist(odd, 'en-US');
    expect(result.source).toBe('fallback-rule');
    expect(result.confidence).toBe('low');
    expect(result.heading).toBeTruthy();
    expect(result.explanation).toBeTruthy();
  });

  it('cobre todos os status principais do domínio com conteúdo útil', () => {
    const statuses: CargoStatus[] = ['open', 'bidding', 'contracting', 'reserved', 'boarded', 'delivered'];
    for (const status of statuses) {
      const result = buildCargoStatusAssist({ ...minimalOpen, status }, 'pt-BR');
      expect(result.source).toBe('mock-ai');
      expect(result.heading?.length ?? 0).toBeGreaterThan(3);
      expect(result.summary.length).toBeGreaterThan(10);
      expect(result.explanation?.length ?? 0).toBeGreaterThan(10);
      expect(result.nextSteps.length).toBeGreaterThan(0);
    }
  });

  it('retorna textos localizados para pt-BR, en-US e es', () => {
    const pt = buildCargoStatusAssist(minimalOpen, 'pt-BR');
    const en = buildCargoStatusAssist(minimalOpen, 'en-US');
    const es = buildCargoStatusAssist(minimalOpen, 'es');

    expect(pt.summary).not.toEqual(en.summary);
    expect(en.summary).not.toEqual(es.summary);
    expect(pt.heading).not.toEqual(en.heading);
    expect(en.heading).not.toEqual(es.heading);
  });

  it('mantém estabilidade com ausência de dados opcionais', () => {
    const cargoWithoutOptional: Cargo = {
      ...minimalOpen,
      operationalRisks: undefined,
      documentReadiness: undefined
    };
    const result = buildCargoStatusAssist(cargoWithoutOptional, 'es');
    expect(result.source).toBe('mock-ai');
    expect(result.blockers).toEqual(expect.any(Array));
    expect(result.risks).toEqual(expect.any(Array));
    expect(result.attentionPoints).toEqual(expect.any(Array));
  });
});
