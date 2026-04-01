import { describe, expect, it } from 'vitest';

import { mapAudiences } from './utils';

describe('mapAudiences', () => {
  it('returns empty array for undefined input', () => {
    expect(mapAudiences(undefined)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(mapAudiences([])).toEqual([]);
  });

  it('includes ntRules as rules in the mapped output', () => {
    const ntRules = { type: 'trait', trait: 'isLoggedIn', operator: 'equals', value: true };
    const result = mapAudiences([
      {
        sys: { id: 'sys-1' },
        ntAudienceId: 'aud-abc',
        ntName: 'Logged In Users',
        ntDescription: 'Users who are logged in',
        ntRules,
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'aud-abc',
      name: 'Logged In Users',
      description: 'Users who are logged in',
      rules: ntRules,
    });
  });

  it('passes rules as undefined when ntRules is absent', () => {
    const result = mapAudiences([
      {
        sys: { id: 'sys-2' },
        ntAudienceId: 'aud-xyz',
        ntName: 'All Users',
      },
    ]);

    expect(result[0].rules).toBeUndefined();
  });

  it('filters out null entries', () => {
    const result = mapAudiences([
      null,
      {
        sys: { id: 'sys-3' },
        ntAudienceId: 'aud-real',
        ntName: 'Real Audience',
        ntRules: {},
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('aud-real');
  });
});
