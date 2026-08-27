import { describe, expect, it } from 'vitest';
import { outputPathFor } from '../src/exporter';
import type { RepairItem, RepairOptions } from '../src/types';

const item = {
  id: '1',
  source: { path: 'Album/IMG 1.JPG', name: 'IMG 1.JPG', size: 1, type: 'image/jpeg', lastModified: 0, getFile: async () => new File([], 'IMG 1.JPG') },
  status: 'matched',
  metadata: { timestamp: 1600000000 }
} satisfies RepairItem;

const options: RepairOptions = { deduplicate: true, rename: true, renamePattern: 'date-original', organize: 'year-month', includeUnmatched: true };

describe('output naming', () => {
  it('builds a chronological year/month path', () => {
    expect(outputPathFor(item, options, 1)).toBe('2020/09/2020-09-13_12-26-40_IMG 1.jpg');
  });

  it('supports a stable sequence suffix', () => {
    expect(outputPathFor(item, { ...options, renamePattern: 'date-sequence' }, 7)).toBe('2020/09/2020-09-13_12-26-40_0007.jpg');
  });
});
