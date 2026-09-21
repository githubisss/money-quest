import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AlertOctagon, CheckCircle2, ShieldAlert, ArrowRight, Award, FileText, Map, X } from 'lucide-react';
import { CaseLevel } from '../types';
import { sound } from '../utils/audio';

interface DiscoveryAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: CaseLevel;
  onOpenReport: () => void;
  onOpenNetworkMap: () => void;
  onNextLevel?: () => void;
}

export const DiscoveryAlertModal: React.FC<DiscoveryAlertModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  onOpenReport,
  onOpenNetworkMap,
  onNextLevel
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playAlert();
      // Retro gold/orange confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ef4444', '#fef08a']
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const accountsCount = activeCase.accounts.length;
  const transactionsCount = activeCase.transactions.length;
  const patternString = activeCase.loopPattern
    .map(accId => activeCase.accounts.find(a => a.id === accId)?.alias || accId)
    .join(' → ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 select-none">
      <div className="w-full max-w-xl bg-[#1c0e07] border-4 border-[#dc2626] text-[#fef3c7] shadow-2xl p-5 sm:p-7 pixel-box-red relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 pixel-btn bg-[#2a1208] text-amber-300 p-1"
          title="Close alert"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Warning Banner */}
        <div className="flex items-center gap-3 border-b-2 border-[#7f1d1d] pb-3 mb-4">
          <div className="p-2 bg-red-950 border-2 border-red-600 animate-pulse">
            <AlertOctagon className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <div className="text-[10px] text-red-400 font-pixel tracking-wider">
              🚨 NETWORK DISCOVERED
            </div>
            <h2 className="text-sm sm:text-base font-pixel text-yellow-300">
              &quot;SUSPICIOUS MONEY LOOP&quot;
            </h2>
          </div>
        </div>

        {/* Reward XP Badge */}
        <div className="mb-4 bg-[#2b1708] border border-[#f59e0b] p-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-yellow-400 font-pixel">
            <Award className="w-4 h-4" />
            <span>INVESTIGATION XP EARNED</span>
          </div>
          <span className="text-yellow-300 font-pixel font-bold bg-[#140b04] px-2 py-0.5 border border-[#ca8a04]">
            +50 XP
          </span>
        </div>

        {/* Case Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-[#0f0703] border-2 border-[#381a0b] p-3 text-center">
          <div>
            <div className="text-[8px] text-[#a3795b] font-pixel">ACCOUNTS</div>
            <div className="text-base font-pixel text-yellow-400 font-bold mt-1">
              {accountsCount}
            </div>
          </div>
          <div>
            <div className="text-[8px] text-[#a3795b] font-pixel">TRANSFERS</div>
            <div className="text-base font-pixel text-yellow-400 font-bold mt-1">
              {transactionsCount}
            </div>
          </div>
          <div>
            <div className="text-[8px] text-[#a3795b] font-pixel">TOTAL MOVED</div>
            <div className="text-xs sm:text-sm font-pixel text-emerald-400 font-bold mt-1">
              ₹{activeCase.targetAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Pattern Path */}
        <div className="mb-4 bg-[#29140a] border border-[#522510] p-3">
          <div className="text-[9px] text-[#a3795b] font-pixel mb-1">
            CIRCULAR PATTERN DETECTED:
          </div>
          <div className="text-xs sm:text-sm font-pixel text-yellow-300 tracking-wider">
            {patternString}
          </div>
        </div>

        {/* Why was this flagged? */}
        <div className="mb-5 bg-[#140a04] border-2 border-[#3d1a08] p-3.5">
          <div className="text-[10px] text-yellow-400 font-pixel mb-2.5 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>WHY WAS THIS FLAGGED?</span>
          </div>
          <ul className="space-y-1.5 text-[9px] sm:text-[10px] text-amber-100 font-mono">
            {activeCase.whyFlagged.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer mandate: "Potentially suspicious pattern detected. Further investigation required." */}
        <div className="mb-5 p-2.5 bg-red-950/40 border-l-4 border-red-500 text-[9px] text-red-200 font-mono leading-relaxed">
          ⚠ <strong>INVESTIGATIVE NOTICE:</strong> Potentially suspicious pattern detected. Further investigation required. This output is an investigative aid and does not constitute a legal determination of criminal conduct.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-[#3d1a08]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenReport();
              }}
              className="pixel-btn bg-[#1e293b] hover:bg-[#334155] text-cyan-300 text-xs px-3 py-2 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>FULL REPORT</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenNetworkMap();
              }}
              className="pixel-btn bg-[#047857] hover:bg-[#065f46] text-white text-xs px-3 py-2 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Map className="w-3.5 h-3.5" />
              <span>NETWORK MAP</span>
            </button>
          </div>

          {onNextLevel && (
            <button
              onClick={onNextLevel}
              className="pixel-btn bg-[#d97706] hover:bg-[#b45309] text-black font-bold text-xs px-4 py-2 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <span>NEXT CASE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
