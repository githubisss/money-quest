import React from 'react';
import { Play, Sparkles, Shield, MapPin, DollarSign, X } from 'lucide-react';
import { CaseLevel } from '../types';
import { sound } from '../utils/audio';

interface CaseBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseLevel: CaseLevel;
  onStartCase: () => void;
}

export const CaseBriefingModal: React.FC<CaseBriefingModalProps> = ({
  isOpen,
  onClose,
  caseLevel,
  onStartCase
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 select-none">
      <div className="w-full max-w-lg bg-[#180e07] border-4 border-[#eab308] text-[#fef3c7] shadow-2xl p-5 sm:p-7 pixel-box-gold relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 pixel-btn bg-[#2a1407] hover:bg-[#42200c] text-amber-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="text-center border-b-2 border-[#45220c] pb-4 mb-4">
          <div className="inline-flex items-center gap-1.5 bg-[#2b1708] text-amber-400 px-3 py-1 border border-[#92400e] text-[9px] font-pixel mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DISPATCH BRIEFING</span>
          </div>
          <h1 className="text-base sm:text-lg font-pixel text-yellow-300">
            &quot;Welcome, Detective.&quot;
          </h1>
          <p className="text-xs sm:text-sm font-pixel text-[#fed7aa] mt-1">
            Your first case is waiting.
          </p>
        </div>

        {/* Case Badge & Objective */}
        <div className="bg-[#0f0703] border-2 border-[#381a0b] p-4 mb-4">
          <div className="flex items-center justify-between border-b border-[#241105] pb-2 mb-2">
            <span className="text-[10px] font-pixel text-yellow-400">
              CASE #{caseLevel.code}
            </span>
            <span className="text-[9px] font-pixel bg-[#3d1e08] text-amber-300 px-2 py-0.5">
              DEPTH: 0{caseLevel.depth}
            </span>
          </div>

          <div className="text-xs sm:text-sm font-pixel text-white mb-2 leading-relaxed">
            &quot;₹{caseLevel.targetAmount.toLocaleString('en-IN')} has moved through several accounts.&quot;
          </div>
          <div className="text-xs font-pixel text-amber-300">
            &quot;Can you find where the money went?&quot;
          </div>
        </div>

        {/* Case Details Checklist */}
        <div className="grid grid-cols-2 gap-2 mb-5 text-[9px] font-mono">
          <div className="bg-[#241308] p-2 border border-[#4a220b] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[#a3795b]">Target Capital:</div>
              <div className="font-pixel text-yellow-300">₹{caseLevel.targetAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="bg-[#241308] p-2 border border-[#4a220b] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[#a3795b]">Cavern Sector:</div>
              <div className="font-pixel text-yellow-300">{caseLevel.title}</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sound.playCoin();
            onStartCase();
          }}
          className="pixel-btn bg-[#16a34a] hover:bg-[#15803d] text-white font-pixel text-xs sm:text-sm px-6 py-3.5 flex items-center justify-center gap-2 w-full shadow-lg"
        >
          <Play className="w-4 h-4 text-yellow-300" />
          <span>▶ START CASE</span>
        </button>

      </div>
    </div>
  );
};
