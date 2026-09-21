import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScreenView, CaseLevel, AccountNode } from './types';
import { INITIAL_CASES } from './data/initialCases';
import { sound } from './utils/audio';
import { HomeScreen } from './components/HomeScreen';
import { GameHUD } from './components/GameHUD';
import { PixelDetectiveCanvas } from './components/PixelDetectiveCanvas';
import { TraceModal } from './components/TraceModal';
import { DiscoveryAlertModal } from './components/DiscoveryAlertModal';
import { NetworkMapModal } from './components/NetworkMapModal';
import { InvestigationReportModal } from './components/InvestigationReportModal';
import { LoadDataModal } from './components/LoadDataModal';
import { CaseBriefingModal } from './components/CaseBriefingModal';
import { InventoryDrawer } from './components/InventoryDrawer';
import { AccountDetailsModal } from './components/AccountDetailsModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ScreenView>('title');
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [activeCase, setActiveCase] = useState<CaseLevel>(INITIAL_CASES[0]);

  // Player state
  const [playerX, setPlayerX] = useState<number>(3);
  const [playerY, setPlayerY] = useState<number>(3);
  const [playerDir, setPlayerDir] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isWalking, setIsWalking] = useState<boolean>(false);

  // Discovery & Investigation progress
  const [discoveredAccountIds, setDiscoveredAccountIds] = useState<Set<string>>(
    new Set(['ACC_A'])
  );
  const [discoveredClueIds, setDiscoveredClueIds] = useState<Set<string>>(
    new Set(['CLUE-1'])
  );
  const [investigationXp, setInvestigationXp] = useState<number>(10);
  const [moneyFound, setMoneyFound] = useState<number>(100000);
  const [suspicionLevel, setSuspicionLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');

  // Tracing animation state
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [traceStepIndex, setTraceStepIndex] = useState<number>(0);
  const [traceProgress, setTraceProgress] = useState<number>(0);
  const [isTracePaused, setIsTracePaused] = useState<boolean>(false);
  const [shakeScreen, setShakeScreen] = useState<boolean>(false);

  // Modals & Overlays
  const [inspectedAccountId, setInspectedAccountId] = useState<string | null>(null);
  const [showTraceModal, setShowTraceModal] = useState<boolean>(false);
  const [showDiscoveryAlert, setShowDiscoveryAlert] = useState<boolean>(false);
  const [showNetworkMap, setShowNetworkMap] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showLoadData, setShowLoadData] = useState<boolean>(false);
  const [showCaseBriefing, setShowCaseBriefing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const walkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active case changes
  const switchCase = useCallback((caseIndex: number) => {
    const selected = INITIAL_CASES[caseIndex % INITIAL_CASES.length];
    setActiveCaseIndex(caseIndex);
    setActiveCase(selected);
    const originId = selected.accounts[0]?.id || '';
    setDiscoveredAccountIds(new Set([originId]));
    setDiscoveredClueIds(new Set([selected.clues[0]?.id || '']));
    setPlayerX(selected.accounts[0]?.gridX || 3);
    setPlayerY(selected.accounts[0]?.gridY || 3);
    setMoneyFound(selected.targetAmount);
    setSuspicionLevel('LOW');
    setIsTracing(false);
    setTraceStepIndex(0);
    setTraceProgress(0);
    setShowCaseBriefing(true);
  }, []);

  // Move player handler
  const handleMovePlayer = (newX: number, newY: number, dir: 'up' | 'down' | 'left' | 'right') => {
    setPlayerX(newX);
    setPlayerY(newY);
    setPlayerDir(dir);
    setIsWalking(true);

    if (walkingTimeoutRef.current) {
      clearTimeout(walkingTimeoutRef.current);
    }
    walkingTimeoutRef.current = setTimeout(() => {
      setIsWalking(false);
    }, 250);

    // Check if stepped near any undiscovered accounts
    activeCase.accounts.forEach(acc => {
      if (!discoveredAccountIds.has(acc.id)) {
        const dist = Math.hypot(acc.gridX - newX, acc.gridY - newY);
        if (dist <= 1.8) {
          setDiscoveredAccountIds(prev => new Set([...prev, acc.id]));
          setInvestigationXp(xp => xp + 10);
          sound.playCoin();
        }
      }
    });
  };

  // Tracing animation ticker
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const updateTrace = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isTracing && !isTracePaused && activeCase.transactions.length > 0) {
        setTraceProgress(prev => {
          const next = prev + delta * 0.8; // Speed of money packet
          if (next >= 1) {
            // Next transaction hop
            setTraceStepIndex(step => {
              const nextStep = step + 1;
              if (nextStep >= activeCase.transactions.length) {
                // Completed the loop!
                sound.playAlert();
                triggerShake();
                setShowDiscoveryAlert(true);
                setSuspicionLevel('CRITICAL');
                setInvestigationXp(xp => xp + 50);
                setIsTracing(false);
                return 0;
              } else {
                sound.playCoin();
                setInvestigationXp(xp => xp + 10);
                return nextStep;
              }
            });
            return 0;
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(updateTrace);
    };

    animationFrameId = requestAnimationFrame(updateTrace);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isTracing, isTracePaused, activeCase]);

  // Screen shake helper
  const triggerShake = useCallback(() => {
    setShakeScreen(true);
    setTimeout(() => {
      setShakeScreen(false);
    }, 500);
  }, []);

  // Start Investigation from Title Screen
  const handleStartInvestigation = () => {
    setCurrentView('game');
    setShowCaseBriefing(true);
  };

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // Start Tracing
  const handleStartTrace = () => {
    setIsTracing(true);
    setIsTracePaused(false);
    setTraceStepIndex(0);
    setTraceProgress(0);
    setShowTraceModal(true);
    setSuspicionLevel('HIGH');
    sound.playWhoosh();
  };

  const handleNextLevel = () => {
    setShowDiscoveryAlert(false);
    setShowReport(false);
    const nextIndex = (activeCaseIndex + 1) % INITIAL_CASES.length;
    switchCase(nextIndex);
  };

  return (
    <div className="min-h-screen bg-[#140c06] text-[#fef3c7] flex flex-col font-pixel select-none overflow-x-hidden">
      
      {/* 1. HOME / TITLE SCREEN */}
      {currentView === 'title' && (
        <HomeScreen
          onStartInvestigation={handleStartInvestigation}
          onLoadData={() => setShowLoadData(true)}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      )}

      {/* 2. MAIN GAME SCREEN */}
      {currentView === 'game' && (
        <div className="flex-1 flex flex-col items-center justify-between">
          {/* Game-style HUD */}
          <GameHUD
            activeCase={activeCase}
            moneyFound={moneyFound}
            accountsDiscovered={discoveredAccountIds.size}
            totalAccounts={activeCase.accounts.length}
            suspicionLevel={suspicionLevel}
            xp={investigationXp}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onOpenInventory={() => setShowInventory(true)}
            onOpenNetworkMap={() => setShowNetworkMap(true)}
            onOpenReport={() => setShowReport(true)}
            onBackToTitle={() => setCurrentView('title')}
            onOpenCaseBriefing={() => setShowCaseBriefing(true)}
          />

          {/* Main Top-Down Pixel Art Map */}
          <main className="flex-1 w-full max-w-5xl mx-auto p-2 sm:p-4 flex flex-col items-center justify-center">
            <PixelDetectiveCanvas
              accounts={activeCase.accounts}
              transactions={activeCase.transactions}
              playerX={playerX}
              playerY={playerY}
              playerDir={playerDir}
              isWalking={isWalking}
              onMovePlayer={handleMovePlayer}
              onSelectAccount={(id) => setInspectedAccountId(id)}
              onStartTrace={handleStartTrace}
              activeTraceStep={isTracing ? traceStepIndex : null}
              isTracing={isTracing}
              traceProgress={traceProgress}
              shakeScreen={shakeScreen}
              discoveredAccountIds={discoveredAccountIds}
            />
          </main>

          {/* Footer status bar */}
          <footer className="w-full bg-[#0c0704] border-t-2 border-[#241308] py-1.5 px-4 text-center text-[8px] text-[#8c5738] tracking-wider">
            FORENSIC DETECTIVE UNIT // TIP: WALK NEAR ANY ACCOUNT TERMINAL AND PRESS [E] OR TAP INSPECT
          </footer>
        </div>
      )}

      {/* MODAL 1: Account Details Modal */}
      {inspectedAccountId && (
        <AccountDetailsModal
          account={activeCase.accounts.find(a => a.id === inspectedAccountId) || null}
          onClose={() => setInspectedAccountId(null)}
          onStartTrace={() => {
            setInspectedAccountId(null);
            handleStartTrace();
          }}
        />
      )}

      {/* MODAL 2: Interactive Money Trace Modal / Scrubber */}
      <TraceModal
        isOpen={showTraceModal}
        onClose={() => setShowTraceModal(false)}
        accounts={activeCase.accounts}
        transactions={activeCase.transactions}
        currentStep={traceStepIndex}
        progress={traceProgress}
        isPlaying={isTracing && !isTracePaused}
        onTogglePlay={() => {
          if (!isTracing) {
            setIsTracing(true);
            setIsTracePaused(false);
          } else {
            setIsTracePaused(prev => !prev);
          }
        }}
        onRestart={() => {
          setTraceStepIndex(0);
          setTraceProgress(0);
          setIsTracing(true);
          setIsTracePaused(false);
        }}
        onStepSelect={(idx) => {
          setTraceStepIndex(idx);
          setTraceProgress(0);
          setIsTracing(true);
        }}
        onTriggerDiscoveryAlert={() => {
          setShowTraceModal(false);
          setShowDiscoveryAlert(true);
        }}
        onTriggerShake={triggerShake}
      />

      {/* MODAL 3: Suspicious Network Discovery Alert */}
      <DiscoveryAlertModal
        isOpen={showDiscoveryAlert}
        onClose={() => setShowDiscoveryAlert(false)}
        activeCase={activeCase}
        onOpenReport={() => setShowReport(true)}
        onOpenNetworkMap={() => setShowNetworkMap(true)}
        onNextLevel={handleNextLevel}
      />

      {/* MODAL 4: Network Map Topology */}
      <NetworkMapModal
        isOpen={showNetworkMap}
        onClose={() => setShowNetworkMap(false)}
        activeCase={activeCase}
        onStartTrace={() => {
          setShowNetworkMap(false);
          handleStartTrace();
        }}
      />

      {/* MODAL 5: Forensic Investigation Report */}
      <InvestigationReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        activeCase={activeCase}
        moneyTraced={moneyFound}
        onNewInvestigation={() => {
          setShowReport(false);
          switchCase(0);
        }}
      />

      {/* MODAL 6: Load Transaction Data */}
      <LoadDataModal
        isOpen={showLoadData}
        onClose={() => setShowLoadData(false)}
        onLoadCustomCase={(customCase) => {
          setActiveCase(customCase);
          setDiscoveredAccountIds(new Set(['ACC_A']));
          setPlayerX(3);
          setPlayerY(3);
          setMoneyFound(customCase.targetAmount);
          setCurrentView('game');
          setShowCaseBriefing(true);
        }}
        onSelectPresetCase={(caseIdx) => {
          switchCase(caseIdx);
          setCurrentView('game');
        }}
      />

      {/* MODAL 7: Case Dispatch Briefing */}
      <CaseBriefingModal
        isOpen={showCaseBriefing}
        onClose={() => setShowCaseBriefing(false)}
        caseLevel={activeCase}
        onStartCase={() => setShowCaseBriefing(false)}
      />

      {/* MODAL 8: Inventory & Evidence Drawer */}
      <InventoryDrawer
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        activeCase={activeCase}
        discoveredClueIds={discoveredClueIds}
        onOpenNetworkMap={() => {
          setShowInventory(false);
          setShowNetworkMap(true);
        }}
        onStartTrace={() => {
          setShowInventory(false);
          handleStartTrace();
        }}
      />

    </div>
  );
}
