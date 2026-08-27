const VERIFY_URL = import.meta.env.VITE_SOCIOBOT_LICENSE_VERIFY_URL || 'https://api.sociobot.in/api/v1/licenses/verify';
export const BUY_URL = import.meta.env.VITE_SOCIOBOT_BUY_URL || 'https://sociobot.in/buy?product=takeout-photo-metadata-fixer';
const CACHE_KEY = 'takeout-tidy-license';

interface CachedLicense { key: string; verifiedAt: number; valid: boolean }

export function hasLargeLibraryLicense() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '') as CachedLicense;
    return cached.valid && Date.now() - cached.verifiedAt < 365 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function verifyLicense(key: string) {
  const response = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ license_key: key.trim(), product_slug: 'takeout-photo-metadata-fixer' })
  });
  if (!response.ok) throw new Error(response.status === 404 ? 'License verification is not available yet.' : 'The license service could not verify this key.');
  const body = await response.json() as { valid?: boolean; active?: boolean };
  const valid = body.valid === true || body.active === true;
  if (!valid) throw new Error('That license key is not active for this product.');
  localStorage.setItem(CACHE_KEY, JSON.stringify({ key: key.trim(), verifiedAt: Date.now(), valid } satisfies CachedLicense));
  return true;
}
