import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Lock,
  Unlock,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  X,
  Search,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PasswordItem } from '../types/browser';
import {
  encryptWithPassword,
  decryptWithPassword,
  generateSecurePassword,
} from '../lib/crypto';
import { User } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface PasswordManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentUrl?: string;
}

export const PasswordManagerModal: React.FC<PasswordManagerModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUrl,
}) => {
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [vaultItems, setVaultItems] = useState<PasswordItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Add form fields
  const [website, setWebsite] = useState(currentUrl && !currentUrl.startsWith('harpymini://') ? currentUrl : 'https://');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [genLength, setGenLength] = useState(16);

  // Load vault items from Firestore or LocalStorage
  const loadVault = async () => {
    if (user) {
      try {
        const path = `users/${user.uid}/passwords`;
        const snapshot = await getDocs(collection(db, path));
        const items: PasswordItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as PasswordItem);
        });
        setVaultItems(items);
      } catch (err) {
        console.warn('Firestore password load error:', err);
        loadLocalVault();
      }
    } else {
      loadLocalVault();
    }
  };

  const loadLocalVault = () => {
    try {
      const local = localStorage.getItem('harpymini_vault');
      if (local) {
        setVaultItems(JSON.parse(local));
      }
    } catch (e) {
      console.warn('Local vault read error:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadVault();
    }
  }, [isOpen, user]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) {
      setErrorMsg('Please enter your Master Password.');
      return;
    }
    setErrorMsg('');
    setIsUnlocked(true);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setMasterPassword('');
    setRevealedPasswords({});
  };

  const handleGeneratePassword = () => {
    const newPass = generateSecurePassword(genLength, {
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });
    setPassword(newPass);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website || !username || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      // Client-Side AES-GCM Encryption
      const encrypted = await encryptWithPassword(password, masterPassword);
      const newItemId = `pwd-${Date.now()}`;
      const newItem: PasswordItem = {
        id: newItemId,
        userId: user?.uid,
        website,
        username,
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        salt: encrypted.salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (user) {
        const path = `users/${user.uid}/passwords`;
        try {
          await setDoc(doc(db, path, newItemId), {
            id: newItemId,
            userId: user.uid,
            website: newItem.website,
            username: newItem.username,
            encryptedData: newItem.encryptedData,
            iv: newItem.iv,
            createdAt: newItem.createdAt,
            updatedAt: newItem.updatedAt,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      const updated = [newItem, ...vaultItems];
      setVaultItems(updated);
      localStorage.setItem('harpymini_vault', JSON.stringify(updated));

      // Reset form
      setUsername('');
      setPassword('');
      setShowAddForm(false);
      setErrorMsg('');
    } catch (err: any) {
      console.error('Encryption/Save error:', err);
      setErrorMsg('Failed to encrypt credential.');
    }
  };

  const handleRevealPassword = async (item: PasswordItem) => {
    if (revealedPasswords[item.id]) {
      const copy = { ...revealedPasswords };
      delete copy[item.id];
      setRevealedPasswords(copy);
      return;
    }

    try {
      const decrypted = await decryptWithPassword(
        item.encryptedData,
        item.iv,
        item.salt || item.iv,
        masterPassword
      );
      setRevealedPasswords((prev) => ({ ...prev, [item.id]: decrypted }));
    } catch (err) {
      console.error('Decryption failed:', err);
      alert('Decryption failed: Incorrect Master Password.');
    }
  };

  const handleCopyPassword = async (item: PasswordItem) => {
    try {
      let plaintext = revealedPasswords[item.id];
      if (!plaintext) {
        plaintext = await decryptWithPassword(
          item.encryptedData,
          item.iv,
          item.salt || item.iv,
          masterPassword
        );
      }
      navigator.clipboard.writeText(plaintext);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const updated = vaultItems.filter((i) => i.id !== id);
    setVaultItems(updated);
    localStorage.setItem('harpymini_vault', JSON.stringify(updated));

    if (user) {
      const path = `users/${user.uid}/passwords`;
      try {
        await deleteDoc(doc(db, path, id));
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }
    }
  };

  const filteredItems = vaultItems.filter(
    (item) =>
      item.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>HarpyMini Password Vault</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono border border-amber-500/20">
                  AES-GCM 256
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {user ? `Synced with Google Account (${user.email})` : 'Encrypted Locally (Sign in to sync)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                onClick={handleLock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Vault</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Locked Screen */}
        {!isUnlocked ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Unlock Your Password Vault</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Enter your Master Password to derive the AES-GCM 256-bit encryption key with PBKDF2 (100,000 rounds).
              </p>
            </div>

            <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-3">
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter Master Password..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                autoFocus
              />

              {errorMsg && <p className="text-xs text-red-400 font-medium">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Vault</span>
              </button>
            </form>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 max-w-sm mx-auto text-[11px] text-slate-400 flex items-center gap-2 text-left">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Zero-knowledge: Your master password is never stored or transmitted to any server.</span>
            </div>
          </div>
        ) : (
          /* Unlocked Vault Screen */
          <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
            {/* Toolbar: Search & Add */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search websites or usernames..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Credential</span>
              </button>
            </div>

            {/* Add New Credential Form */}
            {showAddForm && (
              <form onSubmit={handleSaveItem} className="p-4 rounded-2xl bg-slate-800/90 border border-amber-500/40 space-y-3">
                <div className="text-xs font-bold text-amber-300">Add New Encrypted Credential</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Website URL</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Username / Email</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">Password</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Strong Password</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or generate password..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    required
                  />
                </div>

                {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm"
                  >
                    Encrypt & Save
                  </button>
                </div>
              </form>
            )}

            {/* List of Saved Credentials */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No credentials stored in vault yet. Click "Add Credential" to save one.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isRevealed = Boolean(revealedPasswords[item.id]);
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">{item.website}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] truncate">{item.username}</div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <code className="text-amber-400 font-mono text-[11px]">
                            {isRevealed ? revealedPasswords[item.id] : '••••••••••••••••'}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRevealPassword(item)}
                          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                          title={isRevealed ? 'Hide Password' : 'Show Decrypted Password'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleCopyPassword(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            copiedId === item.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                          }`}
                          title="Copy Password"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-lg bg-slate-700/60 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete from Vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
