import React from 'react';
import { Play, Building2, Hash, Globe2, ShieldAlert, X } from 'lucide-react';
import { AccountNode } from '../types';
import { sound } from '../utils/audio';

interface AccountDetailsModalProps {
  account: AccountNode | null;
  onClose: () => void;
  onStartTrace: () => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  account,
  onClose,
  onStartTrace
}) => {
  if (!account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 select-none">
      <div className="w-full max-w-md bg-[#180e07] border-4 border-[#3d1d07] text-[#fef3c7] shadow-2xl p-5 pixel-box relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 pixel-btn bg-[#2b1407] hover:bg-[#42200c] text-amber-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Terminal Icon */}
        <div className="flex items-center gap-3 border-b-2 border-[#3d1d0a] pb-3 mb-4">
          <div className="p-2.5 bg-[#2a1608] border-2 border-[#eab308]">
            <span className="text-xl">💰</span>
          </div>
          <div>
            <div className="text-[9px] text-[#a3795b] font-pixel">ACCOUNT TERMINAL</div>
            <h2 className="text-sm font-pixel text-yellow-300">
              [{account.name}]
            </h2>
          </div>
        </div>

        {/* Money Received and Sent (as specified in prompt:
            Money received: ₹1,00,000
            Money sent: ₹98,000)
        */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-[#0f0703] border-2 border-[#2b1406] p-3 text-center">
          <div className="bg-[#140b05] p-2 border border-[#331707]">
            <div className="text-[8px] text-[#a3795b] font-pixel">MONEY RECEIVED</div>
            <div className="text-sm font-pixel text-emerald-400 font-bold mt-1">
              ₹{account.received.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-[#140b05] p-2 border border-[#331707]">
            <div className="text-[8px] text-[#a3795b] font-pixel">MONEY SENT</div>
            <div className="text-sm font-pixel text-amber-400 font-bold mt-1">
              ₹{account.sent.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Technical Profile */}
        <div className="space-y-1.5 text-[9px] font-mono text-amber-100 bg-[#120904] p-3 border border-[#331707] mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Bank: {account.bankName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-amber-400" />
            <span>Account #: {account.accountNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Jurisdiction: {account.jurisdiction}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Status: <strong className="text-yellow-300 font-pixel text-[8px] uppercase">{account.status.replace('_', ' ')}</strong></span>
          </div>
        </div>

        {/* Lore / Field notes */}
        <div className="bg-[#241308] border border-[#522510] p-2.5 mb-5 text-[9px] text-[#fed7aa] font-mono leading-relaxed">
          {account.lore}
        </div>

        {/* Action Button: TRACE MONEY (Large button as explicitly requested in prompt) */}
        <button
          onClick={() => {
            sound.playWhoosh();
            onClose();
            onStartTrace();
          }}
          className="pixel-btn bg-[#16a34a] hover:bg-[#15803d] text-white font-pixel text-xs sm:text-sm py-3.5 px-4 flex items-center justify-center gap-2 w-full shadow-lg"
        >
          <Play className="w-4 h-4 text-yellow-300" />
          <span>▶ TRACE MONEY</span>
        </button>

      </div>
    </div>
  );
};
