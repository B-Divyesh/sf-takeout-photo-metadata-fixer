import { scanSources } from './takeout';
import type { ScanResult, SourceFile } from './types';

// Tiny, valid 2 x 2 images keep the demo fast while still exercising real
// JPEG and PNG container structures. The claim suite removes the inserted
// metadata again and compares every original byte.
const decode = (value: string) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
export const DEMO_JPEG = decode('/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAACAAIDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAH/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AewYU3//Z');
const otherJpeg = decode('/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAACAAIDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAVAQEBAAAAAAAAAAAAAAAAAAAHCP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ADjpSD//2Q==');
export const DEMO_PNG = decode('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGUExURVqelv////7Rk0UAAAABYktHRAH/Ai3eAAAAB3RJTUUH6ggcCjEEnRN33wAAAAxJREFUCNdjYGBgAAAABAABJzQnCgAAAABJRU5ErkJggg==');
const video = new TextEncoder().encode('sample-video-container');
const heic = new TextEncoder().encode('sample-heic-container');
const heif = new TextEncoder().encode('sample-heif-container');

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
    source(`${root}/Lisbon tram.jpg`, DEMO_JPEG, 'image/jpeg'),
    json(`${root}/Lisbon tram.jpg.supplemental-metadata.json`, 'Lisbon tram.jpg', '1656834300', 38.7139, -9.1394),
    source(`${root}/Lisbon tram (1).jpg`, DEMO_JPEG, 'image/jpeg'),
    json(`${root}/Lisbon tram (1).jpg.json`, 'Lisbon tram (1).jpg', '1656834300', 38.7139, -9.1394),
    source(`${root}/Coast walk.png`, DEMO_PNG, 'image/png'),
    json(`${root}/Coast walk.png.supplemental-metadata.json`, 'Coast walk.png', '1662215400', 50.1188, -5.5371),
    source(`${root}/Family scan.jpg`, otherJpeg, 'image/jpeg'),
    source(`${root}/Birthday clip.mp4`, video, 'video/mp4'),
    json(`${root}/Birthday clip.mp4.json`, 'Birthday clip.mp4', '1672531200'),
    source(`${root}/Portrait from the long summer evening by the sea.heic`, heic, 'image/heic'),
    json(`${root}/Portrait from the long summer evening.json`, 'Portrait from the long summer evening by the sea.heic', '1688169600'),
    source(`${root}/Scan.heif`, heif, 'image/heif'),
    json(`${root}/Scan.heif.json`, 'Scan.heif', '1688256000')
  ];
  return scanSources(files, 'files', 'Sample Google Photos Takeout');
}
