import { describe, expect, it } from 'vitest';
import { MOCK_QA_PERSONAS } from '@/shared/qa/mock-qa-personas';
import { defaultUsers } from '@/features/auth/data/auth.mock';

describe('mock-qa-personas', () => {
  it('lista contém os cinco perfis QA e ids alinhados ao mock', () => {
    expect(MOCK_QA_PERSONAS).toHaveLength(5);
    const byEmail = new Map(defaultUsers.map((u) => [u.email.toLowerCase(), u]));
    for (const p of MOCK_QA_PERSONAS) {
      const u = byEmail.get(p.email.toLowerCase());
      expect(u).toBeDefined();
      expect(u!.id).toBe(p.mockUserId);
      expect(u!.role).toBe(p.role);
      expect(u!.approved).toBe(p.approved);
    }
  });
});
