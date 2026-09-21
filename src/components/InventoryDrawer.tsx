import React, { useState } from 'react';
import { X, Search, Coins, FileText, Map, CheckCircle2 } from 'lucide-react';
import { CaseLevel } from '../types';
import { sound } from '../utils/audio';

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: CaseLevel;
  discoveredClueIds: Set<string>;
  onOpenNetworkMap: () => void;
  onStartTrace: () => void;
}

type TabType = 'clues' | 'trails' | 'records' | 'map';

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  isOpen,
  onClose,
  activeCase,
  discoveredClueIds,
  onOpenNetworkMap,
  onStartTrace
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('clues');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 select-none">
      <div className="w-full max-w-2xl bg-[#180e07] border-4 border-[#3d1d07] text-[#fef3c7] shadow-2xl p-4 sm:p-6 pixel-box relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3d1d0a] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💼</span>
            <div>
              <h2 className="text-xs sm:text-sm font-pixel text-[#fde047]">
                DETECTIVE FIELD INVENTORY
              </h2>
              <p className="text-[9px] text-[#fed7aa] font-vt">
                CASE FORENSICS & RECOVERED EVIDENCE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="pixel-btn bg-[#2b1407] hover:bg-[#42200c] text-amber-200 p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-1 mb-4 bg-[#0e0703] p-1 border border-[#2b1406]">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('clues');
              setSelectedItemIndex(0);
            }}
            className={`pixel-btn py-1.5 text-[8px] sm:text-[9px] flex items-center justify-center gap-1 ${
              activeTab === 'clues'
                ? 'bg-[#d97706] text-black font-bold'
                : 'bg-[#1a0f07] text-amber-300'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>🔎 CLUES</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('trails');
              setSelectedItemIndex(0);
            }}
            className={`pixel-btn py-1.5 text-[8px] sm:text-[9px] flex items-center justify-center gap-1 ${
              activeTab === 'trails'
                ? 'bg-[#d97706] text-black font-bold'
                : 'bg-[#1a0f07] text-amber-300'
            }`}
          >
            <Coins className="w-3 h-3" />
            <span>💰 TRAILS</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('records');
              setSelectedItemIndex(0);
            }}
            className={`pixel-btn py-1.5 text-[8px] sm:text-[9px] flex items-center justify-center gap-1 ${
              activeTab === 'records'
                ? 'bg-[#d97706] text-black font-bold'
                : 'bg-[#1a0f07] text-amber-300'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>📜 RECORDS</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
              onOpenNetworkMap();
            }}
            className="pixel-btn py-1.5 text-[8px] sm:text-[9px] bg-[#047857] hover:bg-[#065f46] text-white flex items-center justify-center gap-1"
          >
            <Map className="w-3 h-3" />
            <span>🗺 MAP</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-3 bg-[#0d0703] border-2 border-[#2b1406] p-3">
          
          {/* 1. Clues Tab */}
          {activeTab === 'clues' && (
            <div className="space-y-2">
              <div className="text-[8px] text-[#a3795b] font-pixel mb-1">
                DISCOVERED FIELD CLUES & NOTES:
              </div>
              {activeCase.clues.map((clue, idx) => {
                const isDiscovered = discoveredClueIds.has(clue.id) || idx === 0;
                return (
                  <div
                    key={clue.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedItemIndex(idx);
                    }}
                    className={`cursor-pointer p-2.5 border transition-all ${
                      selectedItemIndex === idx
                        ? 'border-[#fde047] bg-[#291509]'
                        : 'border-[#331707] bg-[#140b05]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{clue.icon}</span>
                        <span className="text-xs font-pixel text-yellow-300">
                          {clue.title}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-[#9ca3af]">
                        {clue.timestamp}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#fed7aa] font-mono mt-1.5 leading-relaxed">
                      {isDiscovered ? clue.description : '🔒 Clue locked. Explore underground accounts to recover.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Trails Tab */}
          {activeTab === 'trails' && (
            <div className="space-y-2">
              <div className="text-[8px] text-[#a3795b] font-pixel mb-1">
                MONEY TRAILS IN CURRENT CAVERN:
              </div>
              <div className="bg-[#1a0f07] p-3 border border-[#3b1d0a] space-y-2">
                <div className="text-xs font-pixel text-yellow-400">
                  TRAIL PATTERN: {activeCase.loopPattern.join(' → ')}
                </div>
                <div className="text-[10px] text-amber-200 font-mono">
                  Principal Target Amount: ₹{activeCase.targetAmount.toLocaleString('en-IN')}
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onStartTrace();
                  }}
                  className="pixel-btn bg-[#16a34a] hover:bg-[#15803d] text-white text-[10px] px-3 py-1.5 flex items-center gap-1.5 mt-2"
                >
                  <span>REPLAY MONEY TRACE</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Transaction Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-2">
              <div className="text-[8px] text-[#a3795b] font-pixel mb-1">
                CRYPTOGRAPHIC WIRE AUDIT LOGS:
              </div>
              {activeCase.transactions.map((tx) => (
                <div key={tx.id} className="bg-[#140b05] border border-[#331707] p-2 text-[9px] font-mono">
                  <div className="flex justify-between text-yellow-400 font-pixel text-[8px] mb-1">
                    <span>{tx.id} // {tx.timestamp}</span>
                    <span className="text-emerald-400">₹{tx.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[#fed7aa]">
                    {tx.fromId} ➔ {tx.toId} (&quot;{tx.memo}&quot;)
                  </div>
                  <div className="text-[8px] text-[#9ca3af] mt-0.5">
                    Hash: {tx.hash}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
