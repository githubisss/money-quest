import React from 'react';
import { FileText, Download, RotateCcw, X, ShieldAlert } from 'lucide-react';
import { CaseLevel } from '../types';
import { sound } from '../utils/audio';

interface InvestigationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: CaseLevel;
  moneyTraced: number;
  onNewInvestigation: () => void;
}

export const InvestigationReportModal: React.FC<InvestigationReportModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  moneyTraced,
  onNewInvestigation
}) => {
  if (!isOpen) return null;

  const accountsList = activeCase.accounts.map(a => a.alias).join(', ');
  const pathString = activeCase.loopPattern
    .map(accId => activeCase.accounts.find(a => a.id === accId)?.alias || accId)
    .join(' → ');

  const handleExport = () => {
    sound.playClick();
    const reportContent = `=====================================================
📜 MONEY QUEST - FORENSIC FINANCIAL DOSSIER
=====================================================
Network ID:        ${activeCase.code}
Case Title:        ${activeCase.title} - ${activeCase.subtitle}
Total Money Traced: ₹${moneyTraced.toLocaleString('en-IN')}
Accounts Involved: ${accountsList}
Transaction Path:  ${pathString}

DETECTED PATTERNS:
[!] Circular capital rotation detected
[!] High velocity intra-hour bank transfers
[!] Multi-entity intermediary structuring

ACCOUNTS RECORDED:
${activeCase.accounts.map(a => `- ${a.name} (${a.alias}): Balance ₹${a.balance}, Bank: ${a.bankName}`).join('\n')}

AUDIT TRAIL LOGS:
${activeCase.transactions.map(t => `- [${t.timestamp}] ${t.fromId} -> ${t.toId}: ₹${t.amount.toLocaleString('en-IN')} | Ref: ${t.hash}`).join('\n')}

INVESTIGATIVE NOTICE:
"Potentially suspicious transaction network detected.
This result is an investigative aid and not a determination of criminal activity."
=====================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MONEY_QUEST_REPORT_${activeCase.code}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 select-none">
      <div className="w-full max-w-2xl bg-[#170e08] border-4 border-[#45220c] text-[#fef3c7] shadow-2xl p-5 sm:p-7 pixel-box relative max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 pixel-btn bg-[#2a1407] hover:bg-[#42200c] text-amber-200 p-1.5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#3d1d0a] pb-4 mb-4">
          <div className="p-2.5 bg-amber-950 border-2 border-amber-600">
            <FileText className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="text-[9px] text-[#a3795b] font-pixel">
              CONFIDENTIAL FORENSIC DOSSIER
            </div>
            <h2 className="text-sm sm:text-base font-pixel text-yellow-300">
              📜 INVESTIGATION REPORT
            </h2>
          </div>
        </div>

        {/* Details Table */}
        <div className="space-y-3 bg-[#0d0703] border-2 border-[#2b1406] p-4 text-[10px] font-mono">
          <div className="flex justify-between border-b border-[#241105] pb-1.5">
            <span className="text-[#a3795b]">Network ID:</span>
            <span className="font-pixel text-yellow-400">{activeCase.code}</span>
          </div>

          <div className="flex justify-between border-b border-[#241105] pb-1.5">
            <span className="text-[#a3795b]">Accounts Involved:</span>
            <span className="font-pixel text-amber-200">{accountsList}</span>
          </div>

          <div className="flex justify-between border-b border-[#241105] pb-1.5">
            <span className="text-[#a3795b]">Total Money Traced:</span>
            <span className="font-pixel text-emerald-400 text-xs">
              ₹{moneyTraced.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="pt-1">
            <div className="text-[#a3795b] mb-1">Transaction Path:</div>
            <div className="font-pixel text-xs text-yellow-300 bg-[#1a0f08] p-2 border border-[#3b1d0a]">
              {pathString}
            </div>
          </div>
        </div>

        {/* Detected Patterns */}
        <div className="mt-4 bg-[#211107] border border-[#4a220b] p-3">
          <div className="text-[9px] font-pixel text-yellow-400 mb-2">
            DETECTED PATTERNS:
          </div>
          <div className="space-y-1.5 text-[9px] font-mono">
            <div className="flex items-center gap-2 text-red-300">
              <span className="text-xs">🔴</span>
              <span>Circular movement (Capital returns to originating network)</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <span className="text-xs">🟡</span>
              <span>Rapid intra-hour transfers across independent accounts</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <span className="text-xs">🟡</span>
              <span>Multiple intermediary corporate shell accounts</span>
            </div>
          </div>
        </div>

        {/* Investigative Disclaimer Notice */}
        <div className="mt-4 p-3 bg-red-950/30 border-l-4 border-red-500 text-[9px] text-red-200 font-mono leading-relaxed flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            &quot;Potentially suspicious transaction network detected. This result is an investigative aid and not a determination of criminal activity.&quot;
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-[#381a09]">
          <button
            onClick={handleExport}
            className="pixel-btn bg-[#1e293b] hover:bg-[#334155] text-cyan-300 text-xs px-4 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>⬇ EXPORT REPORT</span>
          </button>

          <button
            onClick={() => {
              sound.playWhoosh();
              onClose();
              onNewInvestigation();
            }}
            className="pixel-btn bg-[#d97706] hover:bg-[#b45309] text-black font-bold text-xs px-4 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🔄 NEW INVESTIGATION</span>
          </button>
        </div>

      </div>
    </div>
  );
};
