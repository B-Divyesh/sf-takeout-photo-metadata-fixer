import { describe, expect, it } from 'vitest';
import { parseSidecar, scanSources, sidecarStem } from '../src/takeout';
import type { SourceFile } from '../src/types';

const source = (path: string, contents: string | Uint8Array): SourceFile => {
  const name = path.split('/').pop()!;
  const part = typeof contents === 'string' ? contents : contents.slice().buffer as ArrayBuffer;
  const file = new File([part], name);
  return { path, name, size: file.size, type: file.type, lastModified: 0, getFile: async () => file };
};

describe('Google Takeout sidecars', () => {
  it('uses geoData when geoDataExif is absent', () => {
    expect(parseSidecar({ photoTakenTime: { timestamp: '1600000000' }, geoData: { latitude: 12.5, longitude: -70.2, altitude: 3 } })).toMatchObject({
      timestamp: 1600000000, latitude: 12.5, longitude: -70.2, altitude: 3
    });
  });

  it('falls back field-by-field when geoDataExif is empty or partial', () => {
    expect(parseSidecar({
      photoTakenTime: { timestamp: '1600000000' },
      geoDataExif: {},
      geoData: { latitude: 51.5, longitude: -0.12, altitude: 16 }
    })).toMatchObject({ latitude: 51.5, longitude: -0.12, altitude: 16 });

    expect(parseSidecar({
      photoTakenTime: { timestamp: '1600000000' },
      geoDataExif: { latitude: 51.5 },
      geoData: { latitude: 1, longitude: -0.12, altitude: 16 }
    })).toMatchObject({ latitude: 51.5, longitude: -0.12, altitude: 16 });
  });

  it('treats zero coordinates as missing', () => {
    expect(parseSidecar({ creationTime: { timestamp: '1600000000' }, geoData: { latitude: 0, longitude: 0, altitude: 0 } })).toEqual({
      timestamp: 1600000000, latitude: undefined, longitude: undefined, altitude: undefined, title: undefined, description: undefined
    });
  });

  it('recognizes supplemental sidecar suffixes', () => {
    expect(sidecarStem('IMG_1234.jpg.supplemental-metadata.json')).toBe('img_1234.jpg');
  });

  it('matches album copy suffixes through JSON title', async () => {
    const files = [
      source('Takeout/Album/Beach (1).jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
      source('Takeout/Album/Beach.jpg.supplemental-metadata.json', JSON.stringify({ title: 'Beach (1).jpg', photoTakenTime: { timestamp: '1600000000' } }))
    ];
    const result = await scanSources(files, 'files', 'fixture');
    expect(result.matchedCount).toBe(1);
    expect(result.items[0].sidecar?.name).toContain('supplemental');
  });

  it('reports invalid JSON without stopping the scan', async () => {
    const result = await scanSources([
      source('photo.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
      source('photo.jpg.json', '{not json')
    ], 'files', 'fixture');
    expect(result.invalidSidecars).toBe(1);
    expect(result.unmatchedCount).toBe(1);
  });
});
