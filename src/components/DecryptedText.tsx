import React, { useEffect, useState } from 'react';
import { decryptVaultText } from '../utils/security';

interface DecryptedTextProps {
  ciphertext: string;
  ivB64?: string;
  vaultKey: CryptoKey;
  className?: string;
}

/**
 * Renders real AES-256-GCM ciphertext (as stored on EvidenceItem.description) by
 * decrypting it client-side with the session vault key. Falls back to a lock
 * placeholder if decryption fails (wrong/rotated key) rather than throwing.
 */
export const DecryptedText: React.FC<DecryptedTextProps> = ({ ciphertext, ivB64, vaultKey, className }) => {
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!ivB64) {
      setText(ciphertext);
      return;
    }
    setText(null);
    setFailed(false);
    decryptVaultText(vaultKey, ciphertext, ivB64)
      .then(plain => { if (!cancelled) setText(plain); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [ciphertext, ivB64, vaultKey]);

  if (failed) return <span className={className}>🔒 Conținut criptat — nu poate fi decriptat cu parola curentă a seifului.</span>;
  if (text === null) return <span className={className}>Se decriptează...</span>;
  return <span className={className}>{text}</span>;
};
