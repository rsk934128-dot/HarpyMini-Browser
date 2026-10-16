import React, { useState } from 'react';
import {
  User as UserIcon,
  X,
  LogOut,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onClose();
    } catch (err: any) {
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">HarpyMini Cloud Sync</h3>
              <p className="text-xs text-slate-400">Firebase Auth & Firestore Sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-center">
          {user ? (
            /* Signed In View */
            <div className="space-y-5">
              <div className="w-20 h-20 rounded-full mx-auto p-1 bg-gradient-to-tr from-cyan-400 to-indigo-600 shadow-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white text-xl font-bold">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">{user.displayName || 'Google Account'}</h4>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cloud Sync Active (Firestore)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left space-y-2 text-xs">
                <div className="text-slate-300 font-semibold">What is synced across your devices:</div>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li>✓ Bookmarks and Speed Dial items</li>
                  <li>✓ Non-incognito Browsing History</li>
                  <li>✓ Client-side AES-GCM Encrypted Vault items</li>
                  <li>✓ Saved Offline Reading pages</li>
                  <li>✓ Search engine and privacy settings</li>
                </ul>
              </div>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of HarpyMini</span>
              </button>
            </div>
          ) : (
            /* Signed Out View */
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-cyan-400 shadow-inner">
                <Cloud className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Sign In with Google</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Seamlessly back up and sync your bookmarks, settings, and encrypted credentials across all your devices using Firebase.
                </p>
              </div>

              {errorMsg && <p className="text-xs text-red-400 font-medium">{errorMsg}</p>}

              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 text-left">
                <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero-knowledge client-side encryption ensures your passwords stay completely unreadable even in the cloud.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
