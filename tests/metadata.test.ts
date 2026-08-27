import { describe, expect, it } from 'vitest';
import { createExifTiff, formatExifDate, writeJpegExif, writePngExif } from '../src/metadata';

describe('metadata writer', () => {
  it('formats UTC EXIF dates', () => {
    expect(formatExifDate(1600000000)).toBe('2020:09:13 12:26:40');
  });

  it('creates a TIFF with date and GPS directories', () => {
    const tiff = createExifTiff({ timestamp: 1600000000, latitude: 51.5, longitude: -0.12, altitude: 16.2 });
    expect(new TextDecoder().decode(tiff.slice(0, 2))).toBe('II');
    expect(new TextDecoder().decode(tiff)).toContain('2020:09:13 12:26:40');
    expect(tiff.length).toBeGreaterThan(180);
  });

  it('inserts EXIF directly after the JPEG start marker', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const repaired = writeJpegExif(jpeg, { timestamp: 1600000000 });
    expect([...repaired.slice(0, 4)]).toEqual([0xff, 0xd8, 0xff, 0xe1]);
    expect(new TextDecoder().decode(repaired.slice(6, 12))).toBe('Exif\0\0');
    expect([...repaired.slice(-2)]).toEqual([0xff, 0xd9]);
  });

  it('adds an eXIf chunk before PNG IEND', () => {
    const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
    const repaired = writePngExif(png, { timestamp: 1600000000 });
    expect(new TextDecoder().decode(repaired)).toContain('eXIf');
    expect(new TextDecoder().decode(repaired)).toContain('IEND');
  });
});
