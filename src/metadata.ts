import type { PhotoMetadata } from './types';

const encoder = new TextEncoder();

export function formatExifDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const part = (value: number) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}:${part(date.getUTCMonth() + 1)}:${part(date.getUTCDate())} ${part(date.getUTCHours())}:${part(date.getUTCMinutes())}:${part(date.getUTCSeconds())}`;
}

function writeAscii(view: DataView, offset: number, value: string, length: number) {
  const bytes = encoder.encode(value);
  for (let index = 0; index < length; index += 1) view.setUint8(offset + index, bytes[index] ?? 0);
}

function setEntry(
  view: DataView,
  offset: number,
  tag: number,
  type: number,
  count: number,
  value: number | Uint8Array,
  little = true
) {
  view.setUint16(offset, tag, little);
  view.setUint16(offset + 2, type, little);
  view.setUint32(offset + 4, count, little);
  if (value instanceof Uint8Array) {
    for (let index = 0; index < 4; index += 1) view.setUint8(offset + 8 + index, value[index] ?? 0);
  } else {
    view.setUint32(offset + 8, value, little);
  }
}

function dms(value: number): Array<[number, number]> {
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 1_000_000);
  return [[degrees, 1], [minutes, 1], [seconds, 1_000_000]];
}

function writeRationals(view: DataView, offset: number, values: Array<[number, number]>) {
  values.forEach(([numerator, denominator], index) => {
    view.setUint32(offset + index * 8, numerator, true);
    view.setUint32(offset + index * 8 + 4, denominator, true);
  });
}

export function createExifTiff(metadata: PhotoMetadata): Uint8Array {
  if (!metadata.timestamp) throw new Error('A valid photoTakenTime or creationTime is required');
  const hasGps = Number.isFinite(metadata.latitude) && Number.isFinite(metadata.longitude);
  const ifd0Entries = hasGps ? 3 : 2;
  const ifd0Offset = 8;
  const ifd0Size = 2 + ifd0Entries * 12 + 4;
  const modifiedOffset = ifd0Offset + ifd0Size;
  const exifOffset = modifiedOffset + 20;
  const exifSize = 2 + 2 * 12 + 4;
  const originalOffset = exifOffset + exifSize;
  const digitizedOffset = originalOffset + 20;
  const gpsOffset = digitizedOffset + 20;
  const gpsSize = hasGps ? 2 + 7 * 12 + 4 : 0;
  const latitudeOffset = gpsOffset + gpsSize;
  const longitudeOffset = latitudeOffset + (hasGps ? 24 : 0);
  const altitudeOffset = longitudeOffset + (hasGps ? 24 : 0);
  const total = hasGps ? altitudeOffset + 8 : gpsOffset;
  const bytes = new Uint8Array(total);
  const view = new DataView(bytes.buffer);

  writeAscii(view, 0, 'II', 2);
  view.setUint16(2, 42, true);
  view.setUint32(4, ifd0Offset, true);

  view.setUint16(ifd0Offset, ifd0Entries, true);
  let entry = ifd0Offset + 2;
  setEntry(view, entry, 0x0132, 2, 20, modifiedOffset); entry += 12;
  setEntry(view, entry, 0x8769, 4, 1, exifOffset); entry += 12;
  if (hasGps) setEntry(view, entry, 0x8825, 4, 1, gpsOffset);
  view.setUint32(ifd0Offset + 2 + ifd0Entries * 12, 0, true);

  const date = formatExifDate(metadata.timestamp);
  writeAscii(view, modifiedOffset, date, 20);

  view.setUint16(exifOffset, 2, true);
  setEntry(view, exifOffset + 2, 0x9003, 2, 20, originalOffset);
  setEntry(view, exifOffset + 14, 0x9004, 2, 20, digitizedOffset);
  view.setUint32(exifOffset + 26, 0, true);
  writeAscii(view, originalOffset, date, 20);
  writeAscii(view, digitizedOffset, date, 20);

  if (hasGps) {
    const latitude = metadata.latitude!;
    const longitude = metadata.longitude!;
    const altitude = metadata.altitude ?? 0;
    view.setUint16(gpsOffset, 7, true);
    setEntry(view, gpsOffset + 2, 0x0000, 1, 4, new Uint8Array([2, 3, 0, 0]));
    setEntry(view, gpsOffset + 14, 0x0001, 2, 2, new Uint8Array([latitude < 0 ? 83 : 78, 0]));
    setEntry(view, gpsOffset + 26, 0x0002, 5, 3, latitudeOffset);
    setEntry(view, gpsOffset + 38, 0x0003, 2, 2, new Uint8Array([longitude < 0 ? 87 : 69, 0]));
    setEntry(view, gpsOffset + 50, 0x0004, 5, 3, longitudeOffset);
    setEntry(view, gpsOffset + 62, 0x0005, 1, 1, new Uint8Array([altitude < 0 ? 1 : 0]));
    setEntry(view, gpsOffset + 74, 0x0006, 5, 1, altitudeOffset);
    view.setUint32(gpsOffset + 86, 0, true);
    writeRationals(view, latitudeOffset, dms(latitude));
    writeRationals(view, longitudeOffset, dms(longitude));
    writeRationals(view, altitudeOffset, [[Math.round(Math.abs(altitude) * 1000), 1000]]);
  }
  return bytes;
}

export function writeJpegExif(input: Uint8Array, metadata: PhotoMetadata): Uint8Array {
  if (input[0] !== 0xff || input[1] !== 0xd8) throw new Error('Not a valid JPEG file');
  const tiff = createExifTiff(metadata);
  const prefix = encoder.encode('Exif\0\0');
  const payloadLength = prefix.length + tiff.length;
  if (payloadLength + 2 > 0xffff) throw new Error('Generated EXIF block is too large');
  const result = new Uint8Array(input.length + payloadLength + 4);
  result.set(input.subarray(0, 2), 0);
  result.set([0xff, 0xe1, (payloadLength + 2) >> 8, (payloadLength + 2) & 0xff], 2);
  result.set(prefix, 6);
  result.set(tiff, 6 + prefix.length);
  result.set(input.subarray(2), 6 + payloadLength);
  return result;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array) {
  const typeBytes = encoder.encode(type);
  const output = new Uint8Array(12 + data.length);
  const view = new DataView(output.buffer);
  view.setUint32(0, data.length, false);
  output.set(typeBytes, 4);
  output.set(data, 8);
  const crcInput = new Uint8Array(typeBytes.length + data.length);
  crcInput.set(typeBytes);
  crcInput.set(data, typeBytes.length);
  view.setUint32(8 + data.length, crc32(crcInput), false);
  return output;
}

export function writePngExif(input: Uint8Array, metadata: PhotoMetadata): Uint8Array {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((value, index) => input[index] === value)) throw new Error('Not a valid PNG file');
  const chunks: Uint8Array[] = [input.slice(0, 8)];
  const exif = pngChunk('eXIf', createExifTiff(metadata));
  let offset = 8;
  let inserted = false;
  while (offset + 12 <= input.length) {
    const length = new DataView(input.buffer, input.byteOffset + offset, 4).getUint32(0, false);
    const end = offset + 12 + length;
    if (end > input.length) throw new Error('PNG contains a truncated chunk');
    const type = new TextDecoder().decode(input.subarray(offset + 4, offset + 8));
    if (type === 'IEND' && !inserted) {
      chunks.push(exif);
      inserted = true;
    }
    if (type !== 'eXIf') chunks.push(input.slice(offset, end));
    offset = end;
    if (type === 'IEND') break;
  }
  if (!inserted) throw new Error('PNG is missing its IEND chunk');
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}

export function repairBytes(input: Uint8Array, name: string, metadata?: PhotoMetadata): Uint8Array {
  if (!metadata?.timestamp) return input;
  const extension = name.toLowerCase().split('.').pop();
  if (extension === 'jpg' || extension === 'jpeg') return writeJpegExif(input, metadata);
  if (extension === 'png') return writePngExif(input, metadata);
  return input;
}

export async function repairFile(file: File, metadata?: PhotoMetadata): Promise<Uint8Array> {
  return repairBytes(new Uint8Array(await file.arrayBuffer()), file.name, metadata);
}
