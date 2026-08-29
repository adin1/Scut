export function generateSha256Hash(text: string): string {
  // Simple deterministic client-side hash representation for visual cryptographic seal
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256_${hex}${Date.now().toString(16)}${Math.random().toString(16).substring(2, 8)}`;
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
