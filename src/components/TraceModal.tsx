import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { AccountNode, Transaction } from '../types';
import { sound } from '../utils/audio';

interface TraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountNode[];
  transactions: Transaction[];
  currentStep: number;
  progress: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onStepSelect: (stepIndex: number) => void;
  onTriggerDiscoveryAlert: () => void;
  onTriggerShake: () => void;
}

export const TraceModal: React.FC<TraceModalProps> = ({
  isOpen,
  onClose,
  accounts,
  transactions,
  currentStep,
  progress,
  isPlaying,
  onTogglePlay,
  onRestart,
  onStepSelect,
  onTriggerDiscoveryAlert,
  onTriggerShake
}) => {
  const [timelineIndex, setTimelineIndex] = useState(0);
  const audioAlarmTriggered = useRef(false);

  // Sync timeline index with active transaction step
  useEffect(() => {
    setTimelineIndex(currentStep);
  }, [currentStep]);

  // When trace completes loop back to origin, trigger alarm and discovery
  useEffect(() => {
    if (isPlaying && currentStep >= transactions.length - 1 && progress > 0.9) {
      if (!audioAlarmTriggered.current) {
        audioAlarmTriggered.current = true;
        sound.playAlert();
        onTriggerShake();
        setTimeout(() => {
          onTriggerDiscoveryAlert();
          audioAlarmTriggered.current = false;
        }, 800);
      }
    }
  }, [isPlaying, currentStep, progress, transactions.length, onTriggerShake, onTriggerDiscoveryAlert]);

  if (!isOpen) return null;

  const currentTx = transactions[currentStep % transactions.length];
  const fromAccount = accounts.find(a => a.id === currentTx?.fromId);
  const toAccount = accounts.find(a => a.id === currentTx?.toId);

  // Time bounds for scrubber
  const startTimestamp = transactions[0]?.timestamp || '10:02';
  const endTimestamp = transactions[transactions.length - 1]?.timestamp || '11:02';

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setTimelineIndex(val);
    onStepSelect(val);
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 select-none">
      <div className="w-full max-w-3xl bg-[#1a0f08] border-4 border-[#3a1d0b] text-[#fef3c7] shadow-2xl p-4 sm:p-6 pixel-box relative max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#45230c] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <h2 className="text-xs sm:text-sm font-pixel text-[#fde047]">
                LIVE MONEY TRACE ENGINE
              </h2>
              <p className="text-[9px] sm:text-[10px] text-[#fed7aa] font-vt tracking-wider">
                PHYSICAL TRANSACTION FLOW & ROUTE INSPECTOR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="pixel-btn bg-[#2f190c] hover:bg-[#482613] text-[#fde047] p-1.5"
            title="Close Trace Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Transaction Chain Nodes (A -> B -> C -> D -> A) */}
        <div className="mb-5 bg-[#0e0704] border-2 border-[#331a0a] p-3">
          <div className="text-[9px] text-[#a3795b] mb-2 font-pixel">
            TRANSACTION TRAIL HOP:
          </div>

          <div className="flex flex-wrap items-center justify-between gap-1.5">
            {transactions.map((tx, idx) => {
              const srcAcc = accounts.find(a => a.id === tx.fromId);
              const isCurrent = idx === currentStep;
              const isPast = idx < currentStep;

              return (
                <React.Fragment key={tx.id}>
                  <div
                    onClick={() => onStepSelect(idx)}
                    className={`cursor-pointer border-2 px-2.5 py-1.5 text-center transition-all ${
                      isCurrent
                        ? 'border-[#fde047] bg-[#45230c] scale-105 shadow-md shadow-amber-500/20'
                        : isPast
                        ? 'border-[#059669] bg-[#064e3b]'
                        : 'border-[#26160c] bg-[#140c06] opacity-60'
                    }`}
                  >
                    <div className="text-[8px] font-pixel text-yellow-300">
                      {srcAcc?.alias || tx.fromId}
                    </div>
                    <div className="text-[9px] font-vt text-amber-200">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[7px] text-[#9ca3af] font-mono">
                      {tx.timestamp}
                    </div>
                  </div>

                  {idx < transactions.length && (
                    <div className={`flex items-center ${isCurrent ? 'text-yellow-400 animate-pulse' : 'text-[#783d16]'}`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Final Return Node */}
            <div
              className={`border-2 px-2.5 py-1.5 text-center ${
                currentStep >= transactions.length - 1
                  ? 'border-red-500 bg-[#7f1d1d] text-white animate-pulse'
                  : 'border-[#26160c] bg-[#140c06] opacity-60'
              }`}
            >
              <div className="text-[8px] font-pixel text-red-300">
                {accounts.find(a => a.id === transactions[0]?.fromId)?.alias || 'RETURN'}
              </div>
              <div className="text-[8px] font-vt text-red-200">
                RETURNS TO A
              </div>
            </div>
          </div>
        </div>

        {/* Current Active Transfer Card */}
        {currentTx && fromAccount && toAccount && (
          <div className="mb-5 bg-[#241308] border-2 border-[#57280a] p-3 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Origin Account */}
              <div className="flex-1 bg-[#130a04] p-2.5 border border-[#3d1d07] w-full">
                <div className="text-[8px] text-[#a3795b] font-pixel">ORIGIN</div>
                <div className="text-xs font-pixel text-[#fde047]">{fromAccount.name}</div>
                <div className="text-[10px] text-amber-100 font-vt mt-1">
                  Sent: ₹{currentTx.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[8px] text-[#94a3b8] font-mono mt-0.5">
                  Bank: {fromAccount.bankName}
                </div>
              </div>

              {/* Transfer Details & Animation Flow Indicator */}
              <div className="flex flex-col items-center justify-center px-2 text-center">
                <span className="text-[9px] font-pixel text-amber-300">
                  {isPlaying ? '⚡ MONEY IN TRANSIT' : '⏸ FLOW PAUSED'}
                </span>
                <div className="text-xs sm:text-sm font-bold font-pixel text-[#34d399] my-1">
                  ₹{currentTx.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[8px] text-[#cbd5e1] font-mono">
                  Memo: &quot;{currentTx.memo}&quot;
                </div>
                {/* Progress bar inside transfer */}
                <div className="w-28 bg-[#100905] h-2 border border-[#78350f] mt-1 overflow-hidden">
                  <div
                    className="bg-[#facc15] h-full transition-all duration-75"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>

              {/* Recipient Account */}
              <div className="flex-1 bg-[#130a04] p-2.5 border border-[#3d1d07] w-full">
                <div className="text-[8px] text-[#a3795b] font-pixel">RECIPIENT</div>
                <div className="text-xs font-pixel text-[#6ee7b7]">{toAccount.name}</div>
                <div className="text-[10px] text-emerald-200 font-vt mt-1">
                  Received: ₹{currentTx.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[8px] text-[#94a3b8] font-mono mt-0.5">
                  Bank: {toAccount.bankName}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Timeline Scrubber (10:02 ━━━●━━━━━━━━ 11:02) */}
        <div className="mb-5 bg-[#0f0804] border-2 border-[#331707] p-3">
          <div className="flex items-center justify-between text-[9px] text-[#fed7aa] font-pixel mb-1">
            <span>⏱ {startTimestamp}</span>
            <span className="text-yellow-400 font-bold">
              CURRENT HOP: {currentStep + 1} OF {transactions.length} ({currentTx?.timestamp || ''})
            </span>
            <span>⏱ {endTimestamp}</span>
          </div>

          {/* Scrubber slider */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, transactions.length - 1)}
              value={timelineIndex}
              onChange={handleTimelineChange}
              className="w-full accent-yellow-400 cursor-pointer h-3 bg-[#241308] border border-[#78350f]"
            />
          </div>
          <div className="text-[8px] text-[#a3795b] text-center mt-1">
            Drag the timeline slider to examine transactions at that moment
          </div>
        </div>

        {/* Playback Controls & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#3b1d0a] pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onTogglePlay();
              }}
              className={`pixel-btn text-xs px-4 py-2 flex items-center gap-2 ${
                isPlaying
                  ? 'bg-[#d97706] hover:bg-[#b45309] text-black font-bold'
                  : 'bg-[#16a34a] hover:bg-[#15803d] text-white font-bold'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY TRACE'}</span>
            </button>

            <button
              onClick={() => {
                sound.playWhoosh();
                onRestart();
              }}
              className="pixel-btn bg-[#3b2112] hover:bg-[#4f2d18] text-amber-200 text-xs px-3 py-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESTART</span>
            </button>
          </div>

          {/* Discovery Trigger button */}
          <button
            onClick={() => {
              sound.playAlert();
              onTriggerShake();
              onTriggerDiscoveryAlert();
            }}
            className="pixel-btn bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs px-3 py-2 flex items-center gap-1.5 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 text-yellow-300" />
            <span>SUSPICIOUS LOOP FLAG</span>
          </button>
        </div>

      </div>
    </div>
  );
};
