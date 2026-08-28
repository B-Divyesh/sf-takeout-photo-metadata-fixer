import { scanSources } from './takeout';
import type { ScanResult, SourceFile } from './types';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
const video = new TextEncoder().encode('sample-video-container');
const heic = new TextEncoder().encode('sample-heic-container');

function source(path: string, bytes: Uint8Array, type: string): SourceFile {
  const name = path.split('/').pop()!;
  return {
    path,
    name,
    size: bytes.byteLength,
    type,
    lastModified: 0,
    getFile: async () => new File([bytes.buffer as ArrayBuffer], name, { type, lastModified: 0 })
  };
}

function json(path: string, title: string, timestamp: string, latitude?: number, longitude?: number) {
  return source(path, new TextEncoder().encode(JSON.stringify({
    title,
    photoTakenTime: { timestamp },
    geoData: latitude === undefined ? {} : { latitude, longitude, altitude: 18 }
  })), 'application/json');
}

export async function createDemoScan(): Promise<ScanResult> {
  const root = 'Sample Takeout/Google Photos/Leaving Google Photos';
  const files: SourceFile[] = [
    source(`${root}/Lisbon tram.jpg`, jpeg, 'image/jpeg'),
    json(`${root}/Lisbon tram.jpg.supplemental-metadata.json`, 'Lisbon tram.jpg', '1656834300', 38.7139, -9.1394),
    source(`${root}/Lisbon tram (1).jpg`, jpeg, 'image/jpeg'),
    json(`${root}/Lisbon tram (1).jpg.json`, 'Lisbon tram (1).jpg', '1656834300', 38.7139, -9.1394),
    source(`${root}/Coast walk.png`, png, 'image/png'),
    json(`${root}/Coast walk.png.supplemental-metadata.json`, 'Coast walk.png', '1662215400', 50.1188, -5.5371),
    source(`${root}/Family scan.jpg`, new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0xff, 0xd9]), 'image/jpeg'),
    source(`${root}/Birthday clip.mp4`, video, 'video/mp4'),
    json(`${root}/Birthday clip.mp4.json`, 'Birthday clip.mp4', '1672531200'),
    source(`${root}/Portrait.heic`, heic, 'image/heic'),
    json(`${root}/Portrait.heic.supplemental-metadata.json`, 'Portrait.heic', '1688169600')
  ];
  return scanSources(files, 'files', 'Sample Google Photos Takeout');
}
