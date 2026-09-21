import React, { useState, useEffect } from 'react';
import { Play, FolderOpen, HelpCircle, Volume2, VolumeX, Sparkles, ShieldAlert, Footprints, Network } from 'lucide-react';
import { sound } from '../utils/audio';

interface HomeScreenProps {
  onStartInvestigation: () => void;
  onLoadData: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartInvestigation,
  onLoadData,
  soundEnabled,
  onToggleSound
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; speed: number }[]>([]);

  // Initialize floating pixel dust particles
  useEffect(() => {
    const initialParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.5 ? 3 : 2,
      speed: 0.2 + Math.random() * 0.4
    }));
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          y: p.y - p.speed < 0 ? 100 : p.y - p.speed,
          x: p.x + (Math.random() - 0.5) * 0.3
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#120a05] text-[#fef3c7] flex flex-col items-center justify-between p-4 overflow-hidden select-none">
      
      {/* Background Cave Elements inspired by reference image */}
      {/* Soil texture grid */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#b84e06_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Dug Dark Tunnel silhouette in background */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-48 bg-[#181518] opacity-85 border-x-4 border-[#0c0a0c] pointer-events-none" />

      {/* Floating glowing pixel coins / dust particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bg-amber-400 rounded-none pointer-events-none shadow-sm shadow-yellow-300"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: 0.6 + (p.id % 4) * 0.1
          }}
        />
      ))}

      {/* Scattered Pixel Rocks and Gold Veins in corners */}
      <div className="absolute top-6 left-6 hidden sm:block opacity-80">
        <div className="w-10 h-8 bg-zinc-600 border-2 border-zinc-800" />
        <div className="w-4 h-3 bg-amber-400 mt-1 ml-2" />
      </div>
      <div className="absolute bottom-8 right-8 hidden sm:block opacity-80">
        <div className="w-12 h-10 bg-zinc-600 border-2 border-zinc-800" />
        <div className="w-5 h-4 bg-amber-400 mt-1 mr-2" />
      </div>

      {/* Sound Toggle (Top Right) */}
      <div className="w-full max-w-4xl flex justify-end z-10">
        <button
          onClick={onToggleSound}
          className="pixel-btn bg-[#26150a] hover:bg-[#3d2110] text-yellow-300 p-2"
          title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
        </button>
      </div>

      {/* Main Title Center Block */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-2xl px-3">
        
        {/* Animated Pixel Detective Preview */}
        <div className="mb-4 relative group cursor-pointer" onClick={() => sound.playCoin()}>
          <div className="w-16 h-20 bg-[#fbbca0] border-3 border-black relative mx-auto shadow-xl">
            {/* Yellow hardhat with light */}
            <div className="absolute -top-4 -left-2 w-20 h-6 bg-yellow-400 border-2 border-amber-600" />
            <div className="absolute -top-6 left-4 w-8 h-3 bg-yellow-300 border border-yellow-600" />
            {/* Eyes and smile */}
            <div className="absolute top-4 left-3 w-2 h-3 bg-black" />
            <div className="absolute top-4 right-3 w-2 h-3 bg-black" />
            <div className="absolute top-9 left-4 w-8 h-2 bg-black" />
            {/* Blue pants */}
            <div className="absolute -bottom-6 left-0 right-0 h-6 bg-blue-700 border-x-2 border-b-2 border-blue-950 flex justify-between px-1">
              <div className="w-2.5 h-full bg-blue-800" />
              <div className="w-2.5 h-full bg-blue-800" />
            </div>
            {/* Tool / Pickaxe */}
            <div className="absolute top-4 -left-5 w-4 h-3 bg-zinc-500 border border-black" />
            <div className="absolute top-6 -left-3 w-1.5 h-8 bg-amber-900" />
          </div>
          <div className="mt-8 text-[9px] text-amber-400 font-pixel animate-pulse">
            ★ MONEY DETECTIVE ★
          </div>
        </div>

        {/* Title */}
        <div className="bg-[#1a0f07] border-4 border-[#3b1c08] p-4 sm:p-6 pixel-box-gold w-full mb-6 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl sm:text-3xl animate-bounce">💰</span>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-pixel text-yellow-300 tracking-wider">
              MONEY QUEST
            </h1>
            <span className="text-2xl sm:text-3xl animate-bounce">💰</span>
          </div>

          <p className="text-[10px] sm:text-xs font-pixel text-[#fed7aa] uppercase tracking-wide leading-relaxed">
            &quot;FOLLOW THE MONEY. FIND THE HIDDEN NETWORK.&quot;
          </p>

          <div className="mt-3 text-[9px] text-[#a3795b] font-mono border-t border-[#3a1d0a] pt-2">
            RETRO 2D FORENSIC INVESTIGATION SYSTEM
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={() => {
              sound.playCoin();
              onStartInvestigation();
            }}
            className="pixel-btn bg-[#16a34a] hover:bg-[#15803d] text-white font-pixel text-xs sm:text-sm py-3.5 px-6 flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 text-yellow-300" />
            <span>▶ START INVESTIGATION</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onLoadData();
            }}
            className="pixel-btn bg-[#3b2010] hover:bg-[#522c15] text-[#fef08a] font-pixel text-xs sm:text-sm py-3.5 px-6 flex items-center justify-center gap-2 shadow-lg"
          >
            <FolderOpen className="w-4 h-4 text-amber-300" />
            <span>📂 LOAD TRANSACTION DATA</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowHowToPlay(true);
            }}
            className="pixel-btn bg-[#1e293b] hover:bg-[#334155] text-cyan-300 font-pixel text-xs sm:text-sm py-3 px-6 flex items-center justify-center gap-2 shadow-lg"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>❓ HOW TO PLAY</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between text-[8px] sm:text-[9px] text-[#8c5738] font-pixel pt-4 border-t border-[#26150a] z-10 gap-2">
        <span>CYBERSECURITY & FINANCIAL FORENSICS LAB</span>
        <span>WASD / ARROWS / TAP TO NAVIGATE</span>
      </footer>

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 select-none">
          <div className="w-full max-w-xl bg-[#1a0f07] border-4 border-[#3b1d0a] text-[#fef3c7] shadow-2xl p-5 sm:p-6 pixel-box relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#3d1d0a] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xs sm:text-sm font-pixel text-yellow-300">
                  HOW TO PLAY MONEY QUEST
                </h2>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="pixel-btn bg-[#2b1407] hover:bg-[#42200c] text-amber-200 text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-[10px] font-mono text-amber-100 leading-relaxed">
              <div className="flex items-start gap-3 bg-[#110904] p-3 border border-[#331707]">
                <Footprints className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-pixel text-[9px] text-yellow-300 mb-1">
                    1. EXPLORE THE UNDERGROUND CAVERN
                  </div>
                  Move using WASD, Arrow keys, or by tapping on the screen. Search through dug tunnels to discover hidden financial account terminals (Account A, B, C, D).
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#110904] p-3 border border-[#331707]">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-pixel text-[9px] text-yellow-300 mb-1">
                    2. TRACE THE SUSPICIOUS MONEY
                  </div>
                  Walk up to an account and click <strong>TRACE MONEY</strong>. Watch the money physically travel through tunnels from account to account with animated coins, timelines, and live progress.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#110904] p-3 border border-[#331707]">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-pixel text-[9px] text-yellow-300 mb-1">
                    3. UNCOVER THE HIDDEN LOOP
                  </div>
                  Observe if the capital moves through shell accounts only to return to the original source (A → B → C → D → A). When triggered, the system flags the suspicious circular network.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#110904] p-3 border border-[#331707]">
                <Network className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-pixel text-[9px] text-yellow-300 mb-1">
                    4. FORENSIC DOSSIERS & NETWORK MAPS
                  </div>
                  Review the interactive graph map, examine recovered field clues in your inventory, and export the official investigation dossier.
                </div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={() => {
                  sound.playCoin();
                  setShowHowToPlay(false);
                  onStartInvestigation();
                }}
                className="pixel-btn bg-[#16a34a] hover:bg-[#15803d] text-white font-pixel text-xs px-6 py-3"
              >
                <span>UNDERSTOOD, START CASE</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
