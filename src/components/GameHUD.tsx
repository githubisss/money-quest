import React from 'react';
import { Volume2, VolumeX, Map, Briefcase, FileText, ArrowLeft } from 'lucide-react';
import { CaseLevel } from '../types';

interface GameHUDProps {
  activeCase: CaseLevel;
  moneyFound: number;
  accountsDiscovered: number;
  totalAccounts: number;
  suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  xp: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenInventory: () => void;
  onOpenNetworkMap: () => void;
  onOpenReport: () => void;
  onBackToTitle: () => void;
  onOpenCaseBriefing: () => void;
  onNextCase?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  activeCase,
  moneyFound,
  accountsDiscovered,
  totalAccounts,
  suspicionLevel,
  xp,
  soundEnabled,
  onToggleSound,
  onOpenInventory,
  onOpenNetworkMap,
  onOpenReport,
  onBackToTitle,
  onOpenCaseBriefing
}) => {
  const getSuspicionColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-500 animate-pulse';
      case 'HIGH':
        return 'text-orange-400';
      case 'MEDIUM':
        return 'text-yellow-400';
      default:
        return 'text-emerald-400';
    }
  };

  return (
    <header className="w-full bg-[#180f08] border-b-4 border-[#0e0805] text-[#fef3c7] p-2 md:p-3 select-none relative z-20 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        
        {/* Top Left: Money & Dynamite / Detective tools */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={onBackToTitle}
            className="pixel-btn bg-[#2a170b] hover:bg-[#3d2210] text-[#fde047] text-[10px] px-2 py-1 flex items-center gap-1"
            title="Return to title screen"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">TITLE</span>
          </button>

          <div className="flex items-center gap-2 bg-[#0c0704] border-2 border-[#361e0e] px-3 py-1.5 rounded-none">
            <span className="text-base text-yellow-400">💰</span>
            <div className="flex flex-col">
              <span className="text-[9px] text-[#a3795b] tracking-wider">MONEY FOUND</span>
              <span className="text-xs md:text-sm text-[#fef08a] font-pixel font-bold">
                ₹{moneyFound.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#0c0704] border-2 border-[#361e0e] px-2.5 py-1.5 text-xs text-orange-400">
            <span className="text-sm">🧨</span>
            <span className="text-[10px] font-pixel text-[#fb923c]">TOOLS 32(10)</span>
          </div>
        </div>

        {/* Top Center: Investigation Case # */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCaseBriefing}
            className="flex items-center gap-2 bg-[#2a170b] hover:bg-[#3d2210] border-2 border-[#d97706] px-3 py-1.5 transition-colors cursor-pointer"
            title="Click to view case briefing"
          >
            <span className="text-yellow-400 text-sm">🔎</span>
            <div className="text-left">
              <div className="text-[9px] text-[#fde047] tracking-wider font-bold">
                INVESTIGATION #{activeCase.code}
              </div>
              <div className="text-[10px] text-[#fed7aa] hidden sm:block">
                LEVEL {activeCase.levelNumber}: {activeCase.title}
              </div>
            </div>
          </button>

          <div className="bg-[#0c0704] border-2 border-[#361e0e] px-2.5 py-1.5 text-[9px] text-amber-300 flex items-center gap-1">
            <span>⭐</span>
            <span>{xp} XP</span>
          </div>
        </div>

        {/* Top Right: Depth, Accounts Found, Suspicion Meter & Controls */}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-[#0c0704] border-2 border-[#361e0e] px-2.5 py-1 flex flex-col text-right">
            <div className="text-[8px] text-[#a3795b]">
              DEPTH: <span className="text-amber-400 font-bold">0{activeCase.depth}</span>
            </div>
            <div className="text-[8px] text-[#fed7aa]">
              ACCOUNTS: <span className="text-yellow-400">{accountsDiscovered}/{totalAccounts}</span>
            </div>
            <div className="text-[8px]">
              SUSPICION: <span className={`font-bold ${getSuspicionColor(suspicionLevel)}`}>{suspicionLevel}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenNetworkMap}
              className="pixel-btn bg-[#047857] hover:bg-[#059669] text-white text-[9px] px-2.5 py-2 flex items-center gap-1"
              title="Open Network Graph Map"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">MAP</span>
            </button>

            <button
              onClick={onOpenInventory}
              className="pixel-btn bg-[#9a3412] hover:bg-[#c2410c] text-amber-200 text-[9px] px-2.5 py-2 flex items-center gap-1"
              title="Open Evidence & Clues"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">CLUES</span>
            </button>

            <button
              onClick={onOpenReport}
              className="pixel-btn bg-[#1e293b] hover:bg-[#334155] text-cyan-300 text-[9px] px-2.5 py-2 flex items-center gap-1"
              title="Investigation Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">DOSSIER</span>
            </button>

            <button
              onClick={onToggleSound}
              className="pixel-btn bg-[#29180c] hover:bg-[#452713] text-[#fef08a] p-2"
              title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
