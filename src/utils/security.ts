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

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Derives a real AES-256-GCM key from a passphrase via PBKDF2-SHA256 (Web Crypto API).
 * Pass an existing `saltB64` to re-derive the same key later (e.g. after reload);
 * omit it to generate a fresh random salt for a brand-new vault passphrase.
 */
export async function deriveVaultKey(passphrase: string, saltB64?: string): Promise<{ key: CryptoKey; saltB64: string }> {
  const salt = saltB64 ? new Uint8Array(b64ToBuf(saltB64)) : window.crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return { key, saltB64: bufToB64(salt.buffer) };
}

/** Encrypts text with real AES-256-GCM. Returns base64 ciphertext + base64 IV. */
export async function encryptVaultText(key: CryptoKey, plaintext: string): Promise<{ ciphertextB64: string; ivB64: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return { ciphertextB64: bufToB64(ciphertext), ivB64: bufToB64(iv.buffer) };
}

/** Decrypts text previously sealed with encryptVaultText using the same key. */
export async function decryptVaultText(key: CryptoKey, ciphertextB64: string, ivB64: string): Promise<string> {
  const plaintextBuf = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(b64ToBuf(ivB64)) },
    key,
    b64ToBuf(ciphertextB64)
  );
  return new TextDecoder().decode(plaintextBuf);
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
