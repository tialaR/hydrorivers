import { describe, expect, it } from 'vitest';
import { translateMock, translateMockList } from '@/shared/i18n/mock-content';

describe('shared/i18n/mock-content', () => {
  it('mantém texto original em pt-BR', () => {
    expect(translateMock('pt-BR', 'Navegação interior')).toBe('Navegação interior');
  });

  it('traduz termos conhecidos para en e es', () => {
    expect(translateMock('en-US', 'Navegação interior')).toBe('Inland navigation');
    expect(translateMock('es', 'Romaneio')).toBe('Lista de bultos');
  });

  it('retorna original quando não há tradução mapeada', () => {
    expect(translateMock('en-US', 'Termo não mapeado')).toBe('Termo não mapeado');
  });

  it('retorna string vazia para valores nulos/undefined', () => {
    expect(translateMock('en-US', null)).toBe('');
    expect(translateMock('en-US', undefined)).toBe('');
  });

  it('traduz listas item a item', () => {
    expect(translateMockList('en-US', ['Navegação interior', 'Romaneio'])).toEqual([
      'Inland navigation',
      'Packing list'
    ]);
    expect(translateMockList('es', null)).toEqual([]);
  });
});
