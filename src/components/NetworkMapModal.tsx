import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRight, Building2, Globe2, Hash } from 'lucide-react';
import { CaseLevel, AccountNode } from '../types';
import { sound } from '../utils/audio';

interface NetworkMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: CaseLevel;
  onStartTrace: () => void;
}

export const NetworkMapModal: React.FC<NetworkMapModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  onStartTrace,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    activeCase.accounts[0]?.id || ''
  );

  if (!isOpen) return null;

  const selectedAccount = activeCase.accounts.find(a => a.id === selectedAccountId);

  // Position nodes in a circular or hexagonal geometric topology in SVG
  const nodeCount = activeCase.accounts.length;
  const centerX = 240;
  const centerY = 190;
  const radius = 130;

  const nodePositions = activeCase.accounts.reduce<Record<string, { x: number; y: number }>>((acc, node, index) => {
    const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
    acc[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
    return acc;
  }, {});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'flagged':
        return <span className="text-[9px] bg-red-950 border border-red-500 text-red-300 px-2 py-0.5 font-pixel">⚠ FLAGGED</span>;
      case 'suspicious':
        return <span className="text-[9px] bg-amber-950 border border-amber-500 text-amber-300 px-2 py-0.5 font-pixel">⚠ SUSPICIOUS</span>;
      default:
        return <span className="text-[9px] bg-sky-950 border border-sky-500 text-sky-300 px-2 py-0.5 font-pixel">UNDER INVESTIGATION</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 select-none">
      <div className="w-full max-w-5xl bg-[#140b05] border-4 border-[#3d1d07] text-[#fef3c7] shadow-2xl p-4 sm:p-6 pixel-box relative flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3b1c09] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺</span>
            <div>
              <h2 className="text-xs sm:text-sm font-pixel text-[#fde047]">
                NETWORK MAP & TOPOLOGY
              </h2>
              <p className="text-[9px] sm:text-[10px] text-[#fed7aa] font-vt">
                CASE {activeCase.code}: TRANSACTION GRAPH VISUALIZATION
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playWhoosh();
                onClose();
                onStartTrace();
              }}
              className="pixel-btn bg-[#16a34a] hover:bg-[#15803d] text-white text-[10px] px-3 py-1.5 flex items-center gap-1 font-pixel"
            >
              <span>TRACE LOOP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="pixel-btn bg-[#2b160b] hover:bg-[#452312] text-[#fde047] p-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout: Left Graph Visualizer, Right Node Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-y-auto">
          
          {/* SVG Transaction Graph Panel */}
          <div className="lg:col-span-7 bg-[#0c0603] border-2 border-[#2b1406] p-3 flex flex-col items-center justify-center relative min-h-[380px]">
            <div className="absolute top-2 left-2 text-[8px] text-[#a3795b] font-pixel">
              INTERACTIVE GRAPH // CLICK NODES TO INSPECT
            </div>

            <svg viewBox="0 0 480 380" className="w-full h-full max-h-[360px]">
              {/* Defs for arrows and gradients */}
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="24"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Transaction Directed Edges */}
              {activeCase.transactions.map((tx) => {
                const start = nodePositions[tx.fromId];
                const end = nodePositions[tx.toId];
                if (!start || !end) return null;

                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;

                return (
                  <g key={tx.id}>
                    {/* Glowing flow line */}
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="#d97706"
                      strokeWidth="3"
                      strokeDasharray="5,4"
                      markerEnd="url(#arrow)"
                    />
                    {/* Amount badge on edge */}
                    <rect
                      x={midX - 28}
                      y={midY - 9}
                      width="56"
                      height="16"
                      fill="#1e1008"
                      stroke="#92400e"
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 2}
                      fill="#fde047"
                      fontSize="8"
                      fontFamily="'VT323', monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      ₹{(tx.amount / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Account Nodes */}
              {activeCase.accounts.map((acc) => {
                const pos = nodePositions[acc.id];
                if (!pos) return null;
                const isSelected = selectedAccountId === acc.id;

                return (
                  <g
                    key={acc.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedAccountId(acc.id);
                    }}
                    className="cursor-pointer"
                  >
                    {/* Outer selection ring */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="26"
                        fill="none"
                        stroke="#fde047"
                        strokeWidth="3"
                        strokeDasharray="4,2"
                        className="animate-spin"
                        style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                      />
                    )}

                    {/* Node base */}
                    <rect
                      x={pos.x - 18}
                      y={pos.y - 18}
                      width="36"
                      height="36"
                      fill={acc.status === 'flagged' ? '#7f1d1d' : (acc.status === 'suspicious' ? '#78350f' : '#0f172a')}
                      stroke={isSelected ? '#fde047' : '#944204'}
                      strokeWidth="2"
                    />

                    {/* Terminal screen inside node */}
                    <rect
                      x={pos.x - 12}
                      y={pos.y - 12}
                      width="24"
                      height="24"
                      fill="#030712"
                    />

                    {/* Node text alias */}
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      fill={isSelected ? '#fef08a' : '#f8fafc'}
                      fontSize="9"
                      fontFamily="'Press Start 2P', monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {acc.alias.replace('ACC-', '')}
                    </text>

                    {/* Label below node */}
                    <text
                      x={pos.x}
                      y={pos.y + 30}
                      fill="#fed7aa"
                      fontSize="7"
                      fontFamily="'Press Start 2P', monospace"
                      textAnchor="middle"
                    >
                      ₹{(acc.balance / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right: Account Inspector Card */}
          <div className="lg:col-span-5 bg-[#1a0f08] border-2 border-[#381a0b] p-4 flex flex-col justify-between">
            {selectedAccount ? (
              <div className="space-y-3">
                {/* Account Title & Status */}
                <div className="border-b border-[#3a1c0b] pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-pixel text-[#fde047]">
                      {selectedAccount.name}
                    </span>
                    {getStatusBadge(selectedAccount.status)}
                  </div>
                  <div className="text-[10px] text-[#fed7aa] font-mono mt-1">
                    TYPE: {selectedAccount.type.toUpperCase().replace('_', ' ')}
                  </div>
                </div>

                {/* Financial Balance Summary */}
                <div className="grid grid-cols-3 gap-2 bg-[#0d0704] border border-[#2b1406] p-2 text-center">
                  <div>
                    <div className="text-[7px] text-[#a3795b] font-pixel">RECEIVED</div>
                    <div className="text-[10px] font-pixel text-emerald-400 mt-1">
                      ₹{selectedAccount.received.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[7px] text-[#a3795b] font-pixel">SENT</div>
                    <div className="text-[10px] font-pixel text-amber-400 mt-1">
                      ₹{selectedAccount.sent.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[7px] text-[#a3795b] font-pixel">BALANCE</div>
                    <div className="text-[10px] font-pixel text-yellow-300 mt-1">
                      ₹{selectedAccount.balance.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Account Details & Infrastructure */}
                <div className="space-y-1.5 text-[9px] font-mono text-amber-100 bg-[#120904] p-3 border border-[#331707]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bank: {selectedAccount.bankName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>Routing: {selectedAccount.accountNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Jurisdiction: {selectedAccount.jurisdiction}</span>
                  </div>
                </div>

                {/* Lore / Forensic Intelligence Note */}
                <div className="bg-[#241308] border border-[#522510] p-2.5">
                  <div className="text-[8px] text-yellow-400 font-pixel mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    <span>FORENSIC INTELLIGENCE</span>
                  </div>
                  <p className="text-[9px] text-amber-100 font-mono leading-relaxed">
                    {selectedAccount.lore}
                  </p>
                </div>

                {/* Flag Reason if present */}
                {selectedAccount.flagReason && (
                  <div className="bg-red-950/40 border-l-2 border-red-500 p-2 text-[8px] text-red-200 font-mono">
                    <strong>FLAGGED:</strong> {selectedAccount.flagReason}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[#a3795b] font-pixel text-xs">
                SELECT A NODE ON THE GRAPH TO INSPECT
              </div>
            )}

            {/* Bottom Tip */}
            <div className="text-[8px] text-[#855132] font-pixel text-center pt-2 border-t border-[#3a1c0b]">
              CIRCULAR LOOPS SIGNIFY SYNTHETIC CAPITAL ROTATION
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
