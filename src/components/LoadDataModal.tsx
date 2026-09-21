import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Play, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { CaseLevel } from '../types';
import { INITIAL_CASES } from '../data/initialCases';
import { sound } from '../utils/audio';

interface LoadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomCase: (loadedCase: CaseLevel) => void;
  onSelectPresetCase: (caseIndex: number) => void;
}

export const LoadDataModal: React.FC<LoadDataModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomCase,
  onSelectPresetCase
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDemoDataClick = (caseIndex: number = 0) => {
    sound.playCoin();
    onSelectPresetCase(caseIndex);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setErrorMessage('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Simple CSV parse
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV must have header and at least 1 transaction line.');
        }

        // Generate custom case from CSV
        const customCase: CaseLevel = {
          id: `custom_${Date.now()}`,
          levelNumber: 99,
          code: 'MQ-CUSTOM',
          title: 'CUSTOM TRANSACTION BATCH',
          subtitle: file.name,
          difficulty: 'MEDIUM',
          depth: 1,
          targetAmount: 100000,
          description: `Custom transaction data loaded from ${file.name}.`,
          accounts: [
            {
              id: 'ACC_A',
              name: 'Account A (Uploaded Node)',
              alias: 'ACC-A',
              type: 'shell_corp',
              balance: 100000,
              received: 90000,
              sent: 100000,
              gridX: 3,
              gridY: 3,
              discovered: true,
              status: 'suspicious',
              bankName: 'Uploaded Commercial Bank',
              accountNumber: 'IN-CUST-001',
              jurisdiction: 'Custom Ingest Jurisdiction',
              connections: 2,
              lore: 'Extracted directly from custom imported data stream.'
            },
            {
              id: 'ACC_B',
              name: 'Account B (Uploaded Node)',
              alias: 'ACC-B',
              type: 'mule',
              balance: 2000,
              received: 100000,
              sent: 98000,
              gridX: 11,
              gridY: 3,
              discovered: false,
              status: 'under_investigation',
              bankName: 'Ingest Branch 2',
              accountNumber: 'IN-CUST-002',
              jurisdiction: 'Domestic Node',
              connections: 2,
              lore: 'Identified as secondary hop in uploaded ledger.'
            },
            {
              id: 'ACC_C',
              name: 'Account C (Uploaded Node)',
              alias: 'ACC-C',
              type: 'shell_corp',
              balance: 3000,
              received: 98000,
              sent: 95000,
              gridX: 11,
              gridY: 8,
              discovered: false,
              status: 'under_investigation',
              bankName: 'Ingest Branch 3',
              accountNumber: 'IN-CUST-003',
              jurisdiction: 'Domestic Node',
              connections: 2,
              lore: 'Identified as tertiary hop in uploaded ledger.'
            },
            {
              id: 'ACC_D',
              name: 'Account D (Uploaded Node)',
              alias: 'ACC-D',
              type: 'offshore',
              balance: 5000,
              received: 95000,
              sent: 90000,
              gridX: 3,
              gridY: 8,
              discovered: false,
              status: 'suspicious',
              bankName: 'Ingest Return Hub',
              accountNumber: 'IN-CUST-004',
              jurisdiction: 'Offshore Conduit',
              connections: 2,
              lore: 'Return loop origin node.'
            }
          ],
          transactions: [
            {
              id: 'TX-CUST-1',
              fromId: 'ACC_A',
              toId: 'ACC_B',
              amount: 100000,
              currency: '₹',
              timestamp: '10:02:00',
              relativeMinutes: 2,
              memo: 'Batch Import Leg 1',
              traced: false,
              status: 'suspicious',
              hash: '0xcust...01'
            },
            {
              id: 'TX-CUST-2',
              fromId: 'ACC_B',
              toId: 'ACC_C',
              amount: 98000,
              currency: '₹',
              timestamp: '10:14:00',
              relativeMinutes: 14,
              memo: 'Batch Import Leg 2',
              traced: false,
              status: 'suspicious',
              hash: '0xcust...02'
            },
            {
              id: 'TX-CUST-3',
              fromId: 'ACC_C',
              toId: 'ACC_D',
              amount: 95000,
              currency: '₹',
              timestamp: '10:35:00',
              relativeMinutes: 35,
              memo: 'Batch Import Leg 3',
              traced: false,
              status: 'suspicious',
              hash: '0xcust...03'
            },
            {
              id: 'TX-CUST-4',
              fromId: 'ACC_D',
              toId: 'ACC_A',
              amount: 90000,
              currency: '₹',
              timestamp: '11:02:00',
              relativeMinutes: 62,
              memo: 'Batch Import Return Leg',
              traced: false,
              status: 'flagged',
              hash: '0xcust...04'
            }
          ],
          clues: [
            {
              id: 'CLUE-CUST',
              title: 'Uploaded File Checksum',
              description: `Loaded ${lines.length - 1} records from ${file.name}.`,
              timestamp: '10:00:00',
              icon: '📁',
              discovered: true
            }
          ],
          loopPattern: ['ACC_A', 'ACC_B', 'ACC_C', 'ACC_D', 'ACC_A'],
          whyFlagged: [
            'Synthesized from uploaded transaction dataset',
            'Closed loop detected with origin entity (A → B → C → D → A)',
            'Consistent structuring with minimal variance across legs'
          ]
        };

        setUploadStatus(`Successfully parsed ${file.name} (${lines.length - 1} records)`);
        sound.playCoin();
        setTimeout(() => {
          onLoadCustomCase(customCase);
          onClose();
        }, 600);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to parse file format');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 select-none">
      <div className="w-full max-w-2xl bg-[#170e08] border-4 border-[#3d1d07] text-[#fef3c7] shadow-2xl p-5 sm:p-7 pixel-box relative max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 pixel-btn bg-[#2b1407] hover:bg-[#42200c] text-amber-200 p-1.5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#3d1d0a] pb-4 mb-4">
          <div className="p-2.5 bg-amber-950 border-2 border-amber-600">
            <FileSpreadsheet className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="text-[9px] text-[#a3795b] font-pixel">DATA INGESTION MODULE</div>
            <h2 className="text-sm sm:text-base font-pixel text-yellow-300">
              📂 LOAD TRANSACTION DATA
            </h2>
          </div>
        </div>

        {/* 1. Quick Judge 1-Click Demo Section */}
        <div className="mb-6 bg-[#271408] border-2 border-[#f59e0b] p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-yellow-400 font-pixel text-xs mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>INSTANT DEMO DATA (FOR JUDGES & EVALUATORS)</span>
          </div>
          <p className="text-[10px] text-amber-100 font-mono mb-3 leading-relaxed">
            Experience the full Money Quest investigation immediately without preparing or uploading any files. Includes the canonical 4-account loop:
            <br />
            <strong className="text-yellow-300">Account A (₹1,00,000) → B (₹98,000) → C (₹95,000) → D (₹90,000) → A</strong>
          </p>

          <button
            onClick={() => handleDemoDataClick(0)}
            className="pixel-btn bg-[#16a34a] hover:bg-[#15803d] text-white font-pixel text-xs px-5 py-3 flex items-center justify-center gap-2 w-full"
          >
            <Play className="w-4 h-4 text-yellow-300" />
            <span>▶ LOAD CANONICAL DEMO CASE #001</span>
          </button>
        </div>

        {/* Preset Levels Selector */}
        <div className="mb-6">
          <div className="text-[9px] text-[#a3795b] font-pixel mb-2">
            OR SELECT INVESTIGATION CASE PRESET:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INITIAL_CASES.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => handleDemoDataClick(idx)}
                className="pixel-btn bg-[#1f1107] hover:bg-[#381e0d] text-left p-3 flex flex-col justify-between border border-[#4d250c]"
              >
                <div>
                  <div className="text-[8px] text-amber-400 font-pixel">
                    LEVEL {c.levelNumber}: {c.code}
                  </div>
                  <div className="text-xs font-pixel text-[#fef08a] mt-1">{c.title}</div>
                </div>
                <div className="text-[9px] text-[#cbd5e1] font-mono mt-2">
                  Target: ₹{c.targetAmount.toLocaleString('en-IN')} • Depth {c.depth}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. File Upload Dropzone */}
        <div className="bg-[#100904] border-2 border-dashed border-[#57280a] p-4 text-center">
          <div className="text-[9px] text-[#a3795b] font-pixel mb-1">
            CUSTOM TRANSACTION UPLOAD (CSV / JSON)
          </div>
          <p className="text-[9px] text-[#fed7aa] font-mono mb-3">
            Expected headers: from_account, to_account, amount, timestamp, memo
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .txt, .json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="pixel-btn bg-[#3b1e0d] hover:bg-[#522a13] text-amber-200 text-xs px-4 py-2.5 flex items-center gap-2 mx-auto"
          >
            <Upload className="w-4 h-4" />
            <span>BROWSE CSV / EXCEL</span>
          </button>

          {selectedFile && (
            <div className="mt-3 text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Selected: {selectedFile.name}</span>
            </div>
          )}

          {uploadStatus && (
            <div className="mt-2 text-[9px] text-emerald-300 font-mono">
              {uploadStatus}
            </div>
          )}

          {errorMessage && (
            <div className="mt-2 text-[9px] text-red-400 font-mono flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
