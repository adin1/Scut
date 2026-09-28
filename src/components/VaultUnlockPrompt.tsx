import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

interface VaultUnlockPromptProps {
  onUnlock: (passphrase: string) => void;
}

export const VaultUnlockPrompt: React.FC<VaultUnlockPromptProps> = ({ onUnlock }) => {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 6) {
      setError('Parola trebuie să aibă minimum 6 caractere.');
      return;
    }
    onUnlock(passphrase);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans select-none">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-950 text-slate-100 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3"
      >
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-[11px] text-sky-400 w-fit">
          <Lock className="w-3.5 h-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Deblochează Seiful Probatoriu</span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Setează o parolă pentru criptarea reală AES-256-GCM a probelor din această sesiune. Nu este salvată nicăieri — dacă reîncarci pagina, va trebui să o introduci din nou și probele mai vechi nu vor mai putea fi decriptate.
        </p>

        <div className="relative">
          <input
            type={showPassphrase ? 'text' : 'password'}
            value={passphrase}
            onChange={e => { setPassphrase(e.target.value); setError(''); }}
            placeholder="Parolă Seif (minim 6 caractere)"
            autoFocus
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder:text-slate-600"
          />
          <button
            type="button"
            onClick={() => setShowPassphrase(!showPassphrase)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            {showPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {error && <p className="text-[10px] text-rose-400 font-medium">{error}</p>}

        <button
          type="submit"
          className="w-full py-2.5 bg-sky-700 hover:bg-sky-600 active:scale-98 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Deblochează Seiful</span>
        </button>
      </form>
    </div>
  );
};
