import type { EvidenceItem } from '../types/scut';

type BinaryInput = string | ArrayBuffer | Uint8Array;

function toBytes(data: BinaryInput): Uint8Array {
  if (typeof data === 'string') return new TextEncoder().encode(data);
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/**
 * SHA-256 real (Web Crypto), în hex. Determinist: același conținut dă mereu
 * același hash, deci oricine poate reverifica amprenta unei probe.
 */
export async function sha256Hex(data: BinaryInput): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', toBytes(data));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

// Cheia seifului e generată ne-extractibilă: codul paginii o poate folosi,
// dar nu o poate citi sau exporta. Trăiește doar cât sesiunea; persistența
// cu cheie derivată din PIN / biometrie e pasul următor.
let vaultKeyPromise: Promise<CryptoKey> | null = null;
function getVaultKey(): Promise<CryptoKey> {
  if (!vaultKeyPromise) {
    vaultKeyPromise = crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  return vaultKeyPromise;
}

export interface EncryptedPayload {
  algorithm: 'AES-256-GCM';
  iv: string;
  ciphertext: string;
}

export async function encryptForVault(data: BinaryInput): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getVaultKey(), toBytes(data));
  return { algorithm: 'AES-256-GCM', iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)) };
}

/**
 * Sigilează o probă: amprenta SHA-256 se calculează pe conținutul real,
 * iar conținutul e criptat AES-256-GCM înainte de a intra în seif.
 */
export async function sealEvidence(item: EvidenceItem, content: BinaryInput): Promise<EvidenceItem> {
  const [sha256Hash, encryptedPayload] = await Promise.all([sha256Hex(content), encryptForVault(content)]);
  return {
    ...item,
    sha256Hash,
    encryptedPayload,
    isEncrypted: true,
    integrityStatus: 'verified',
    tamperProofVerified: true
  };
}

export function performQuickExit(redirectTo: string = 'https://www.google.com') {
  // In an iframe / web container, we can redirect window or open decoy URL
  try {
    window.location.replace(redirectTo);
  } catch {
    window.location.href = redirectTo;
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
