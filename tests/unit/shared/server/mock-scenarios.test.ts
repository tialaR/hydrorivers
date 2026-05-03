import { describe, expect, it } from 'vitest';
import { getMockScenario, mockScenarioIds } from '@/shared/server/mock-scenarios';

describe('shared/server/mock-scenarios', () => {
  it('retorna cenário vazio quando id é empty-state', () => {
    const scenario = getMockScenario('empty-state');

    expect(scenario.cargoes.length).toBe(0);
    expect(scenario.negotiations.length).toBe(0);
    expect(scenario.vessels.length).toBeGreaterThan(0);
  });

  it('faz fallback para cenário base quando id é inválido', () => {
    const baseScenario = getMockScenario(undefined);
    const invalidScenario = getMockScenario('cenario-invalido');

    expect(invalidScenario.cargoes.length).toBe(baseScenario.cargoes.length);
    expect(invalidScenario.vessels.length).toBe(baseScenario.vessels.length);
    expect(invalidScenario.negotiations.length).toBe(baseScenario.negotiations.length);
  });

  it('mantém dados relacionais no cenário market-active', () => {
    const scenario = getMockScenario('market-active');

    expect(scenario.negotiations.length).toBeGreaterThan(0);
    for (const negotiation of scenario.negotiations) {
      expect(negotiation.cargoId).toBeTruthy();
      expect(negotiation.vesselId).toBeTruthy();
      expect(negotiation.shipperId).toBeTruthy();
      expect(negotiation.carrierId).toBeTruthy();
    }
  });

  it('expõe lista de cenários suportados', () => {
    expect(mockScenarioIds).toContain('market-active');
    expect(mockScenarioIds).toContain('in-transit');
    expect(mockScenarioIds).toContain('error-scenarios');
  });
});
