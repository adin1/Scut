/**
 * Real SHA-256 digest via the browser's native Web Crypto API (window.crypto.subtle).
 * Accepts either text or raw file bytes so uploaded evidence can be hashed by its
 * actual content, not just a label — required for the hash to hold up as integrity
 * proof (Art. 197/282 CPP references throughout the app).
 */
export async function computeSha256Hash(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function performQuickExit(redirectTo: string = 'https://www.google.com') {
  // In an iframe / web container, we can redirect window or open decoy URL
  try {
    window.location.replace(redirectTo);
  } catch {
    window.location.href = redirectTo;
  }
}

/** Great-circle distance in meters between two lat/lng points (haversine formula). */
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
