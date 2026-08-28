import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('factory contracts', () => {
  it('maps every registered claim to exactly one browser-test tag', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
    const source = readFileSync('tests/e2e/claims.spec.ts', 'utf8');
    const ids = claims.map((claim) => claim.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const claim of claims) {
      expect(claim.test).toContain(`@claim:${claim.id}`);
      expect(source.split(`@claim:${claim.id}`).length - 1).toBe(1);
    }
    expect([...source.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]).sort()).toEqual([...ids].sort());
  });

  it('keeps the catalog description verb-first and within 120 characters', () => {
    const description = readFileSync('.factory/catalog-description.txt', 'utf8').trim();
    expect(description.length).toBeLessThanOrEqual(120);
    expect(description.startsWith('Repair ')).toBe(true);
  });

  it('ships complete static metadata in the initial document', () => {
    const html = readFileSync('index.html', 'utf8');
    for (const marker of ['property="og:image"', 'name="twitter:card"', 'rel="apple-touch-icon"', 'rel="canonical"', '<html lang="en">']) expect(html).toContain(marker);
  });
});
