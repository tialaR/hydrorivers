import { describe, expect, it } from 'vitest';
import { hashPassword, isNonEmptyText, toPublicUser, verifyPassword } from '@/shared/server/auth';

describe('shared/server/auth', () => {
  it('gera hash pbkdf2 válido e verifica senha correta', () => {
    const hash = hashPassword('hydro123');

    expect(hash.startsWith('pbkdf2_sha256$100000$')).toBe(true);
    expect(verifyPassword('hydro123', hash)).toBe(true);
  });

  it('rejeita senha incorreta e hash malformado', () => {
    const hash = hashPassword('hydro123');

    expect(verifyPassword('outra-senha', hash)).toBe(false);
    expect(verifyPassword('hydro123', 'invalid')).toBe(false);
    expect(verifyPassword('hydro123', undefined)).toBe(false);
  });

  it('rejeita hash com iteração insegura', () => {
    const lowIterationHash = 'pbkdf2_sha256$9999$salt$abcdef';
    expect(verifyPassword('hydro123', lowIterationHash)).toBe(false);
  });

  it('remove passwordHash ao expor usuário público', () => {
    const user = {
      id: 'u-shipper-1',
      name: 'Tiala Rocha',
      email: 'tiala@hydrorivers.com',
      company: 'Cooperativa Açaí Norte',
      role: 'shipper' as const,
      approved: true,
      city: 'Belém, PA',
      passwordHash: 'pbkdf2_sha256$100000$seed$hash'
    };

    const publicUser = toPublicUser(user);

    expect(publicUser).toMatchObject({
      id: 'u-shipper-1',
      email: 'tiala@hydrorivers.com',
      company: 'Cooperativa Açaí Norte',
      role: 'shipper',
      approved: true
    });
    expect('passwordHash' in publicUser).toBe(false);
  });

  it('valida textos não vazios respeitando limite', () => {
    expect(isNonEmptyText('NF-e')).toBe(true);
    expect(isNonEmptyText('   ')).toBe(false);
    expect(isNonEmptyText(null)).toBe(false);
    expect(isNonEmptyText('A'.repeat(181))).toBe(false);
    expect(isNonEmptyText('A'.repeat(180))).toBe(true);
  });
});
