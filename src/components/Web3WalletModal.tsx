import React, { useState } from 'react';
import {
  Wallet,
  X,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

interface Web3WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Web3WalletModal: React.FC<Web3WalletModalProps> = ({ isOpen, onClose }) => {
  const [network, setNetwork] = useState<'ethereum' | 'solana' | 'polygon'>('ethereum');
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<'view' | 'send' | 'receive'>('view');
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);

  const address = network === 'solana' ? '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin' : '0x71C...4e8B92';
  const fullAddress = network === 'solana' ? '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin' : '0x71C2F391a92B3f8e4E66e2c342938a9a8d4e8B92';

  const balances = {
    ethereum: { token: 'ETH', amount: '1.428', usd: '$4,570.12' },
    solana: { token: 'SOL', amount: '24.50', usd: '$3,820.50' },
    polygon: { token: 'POL', amount: '850.00', usd: '$425.00' },
  }[network];

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendAmount || !sendRecipient) return;
    setTxSuccess(true);
    setTimeout(() => {
      setTxSuccess(false);
      setActiveAction('view');
      setSendAmount('');
      setSendRecipient('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>HarpyMini Web3</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono">
                  UI Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">Decentralized Web & dApp Bridge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Network Selector */}
        <div className="px-6 pt-4 flex gap-2">
          {(['ethereum', 'solana', 'polygon'] as const).map((net) => (
            <button
              key={net}
              onClick={() => setNetwork(net)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors ${
                network === net
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {net}
            </button>
          ))}
        </div>

        {/* Balance Card */}
        {activeAction === 'view' && (
          <div className="p-6 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 via-slate-850 to-slate-900 border border-purple-500/30 text-center space-y-2 shadow-inner">
              <div className="text-xs text-purple-300 font-medium">Testnet Balance</div>
              <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {balances.amount} <span className="text-purple-400 text-lg">{balances.token}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium">{balances.usd}</div>

              {/* Address with copy */}
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
              >
                <span>{address}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            {/* Actions: Send / Receive */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveAction('send')}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-purple-400" />
                <span>Send {balances.token}</span>
              </button>

              <button
                onClick={() => setActiveAction('receive')}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <span>Receive</span>
              </button>
            </div>

            {/* Connected dApps Status */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-white">Browser dApp Bridge</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  EIP-1193 Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                HarpyMini exposes simulated web3 window.ethereum & solana provider listeners for seamless decentralized web3 logins.
              </p>
            </div>
          </div>
        )}

        {/* Send Modal */}
        {activeAction === 'send' && (
          <form onSubmit={handleSendSubmit} className="p-6 space-y-4 text-xs">
            <h4 className="text-sm font-bold text-white">Send {balances.token}</h4>
            <div>
              <label className="text-slate-400 block mb-1">Recipient Address</label>
              <input
                type="text"
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
                placeholder="0x... or ENS domain"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Amount ({balances.token})</label>
              <input
                type="number"
                step="any"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.05"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                required
              />
            </div>

            {txSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-center">
                ✓ Transaction broadcast to {network} testnet!
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAction('view')}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
              >
                Confirm Send
              </button>
            </div>
          </form>
        )}

        {/* Receive Modal */}
        {activeAction === 'receive' && (
          <div className="p-6 text-center space-y-4 text-xs">
            <h4 className="text-sm font-bold text-white">Receive {balances.token}</h4>
            <p className="text-slate-400 text-[11px]">Share your wallet public address to receive assets.</p>
            <div className="p-3 bg-slate-800 rounded-xl font-mono text-purple-300 break-all border border-slate-700">
              {fullAddress}
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 mx-auto ${
                copied ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-500'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Address Copied!' : 'Copy Public Address'}</span>
            </button>
            <button
              onClick={() => setActiveAction('view')}
              className="text-slate-400 hover:underline block mx-auto text-xs pt-2"
            >
              Back to Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
