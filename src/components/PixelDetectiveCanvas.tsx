import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AccountNode, Transaction } from '../types';
import { sound } from '../utils/audio';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Eye } from 'lucide-react';

interface PixelDetectiveCanvasProps {
  accounts: AccountNode[];
  transactions: Transaction[];
  playerX: number;
  playerY: number;
  playerDir: 'up' | 'down' | 'left' | 'right';
  isWalking: boolean;
  onMovePlayer: (x: number, y: number, dir: 'up' | 'down' | 'left' | 'right') => void;
  onSelectAccount: (accountId: string) => void;
  onStartTrace: () => void;
  activeTraceStep: number | null;
  isTracing: boolean;
  traceProgress: number; // 0 to 1
  shakeScreen: boolean;
  discoveredAccountIds: Set<string>;
}

// Grid dimensions
const GRID_COLS = 15;
const GRID_ROWS = 11;
const TILE_SIZE = 48; // Base tile size in px

export const PixelDetectiveCanvas: React.FC<PixelDetectiveCanvasProps> = ({
  accounts,
  transactions,
  playerX,
  playerY,
  playerDir,
  isWalking,
  onMovePlayer,
  onSelectAccount,
  onStartTrace,
  activeTraceStep,
  isTracing,
  traceProgress,
  shakeScreen,
  discoveredAccountIds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nearbyAccount, setNearbyAccount] = useState<AccountNode | null>(null);
  const [walkFrame, setWalkFrame] = useState(0);

  // Cycle walking animation frames
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWalking) {
      interval = setInterval(() => {
        setWalkFrame(f => (f + 1) % 4);
      }, 150);
    } else {
      setWalkFrame(0);
    }
    return () => clearInterval(interval);
  }, [isWalking]);

  // Check if player is near any account
  useEffect(() => {
    const found = accounts.find(acc => {
      const dx = Math.abs(acc.gridX - playerX);
      const dy = Math.abs(acc.gridY - playerY);
      return dx <= 1.5 && dy <= 1.5;
    });

    if (found) {
      setNearbyAccount(found);
      if (!discoveredAccountIds.has(found.id)) {
        sound.playDiscover();
      }
    } else {
      setNearbyAccount(null);
    }
  }, [playerX, playerY, accounts, discoveredAccountIds]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'KeyW', 'ArrowDown', 'KeyS', 'ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD', 'Space', 'KeyE'].includes(e.code)) {
      e.preventDefault();
    }

    let nextX = playerX;
    let nextY = playerY;
    let dir: 'up' | 'down' | 'left' | 'right' = playerDir;

    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      nextY = Math.max(1, playerY - 1);
      dir = 'up';
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      nextY = Math.min(GRID_ROWS - 2, playerY + 1);
      dir = 'down';
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      nextX = Math.max(1, playerX - 1);
      dir = 'left';
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      nextX = Math.min(GRID_COLS - 2, playerX + 1);
      dir = 'right';
    } else if (e.code === 'KeyE' || e.code === 'Space') {
      if (nearbyAccount) {
        sound.playClick();
        onSelectAccount(nearbyAccount.id);
      }
      return;
    }

    if (nextX !== playerX || nextY !== playerY) {
      sound.playStep();
      onMovePlayer(nextX, nextY, dir);
    }
  }, [playerX, playerY, playerDir, nearbyAccount, onMovePlayer, onSelectAccount]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable crisp pixel-art rendering
    ctx.imageSmoothingEnabled = false;

    // Clear
    ctx.fillStyle = '#140c06';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Underground Burnt-Orange Textured Soil Ground
    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Base orange soil tone
        const baseVariant = (x * 7 + y * 13) % 5;
        if (baseVariant === 0) ctx.fillStyle = '#b84e06';
        else if (baseVariant === 1) ctx.fillStyle = '#c75608';
        else if (baseVariant === 2) ctx.fillStyle = '#a44204';
        else if (baseVariant === 3) ctx.fillStyle = '#d9630a';
        else ctx.fillStyle = '#8f3803';

        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        // Pixel dither texture in soil
        ctx.fillStyle = 'rgba(40, 15, 0, 0.25)';
        for (let i = 0; i < 4; i++) {
          const dotX = px + ((x * 19 + i * 11) % (TILE_SIZE - 4));
          const dotY = py + ((y * 23 + i * 13) % (TILE_SIZE - 4));
          ctx.fillRect(dotX, dotY, 3, 3);
        }

        // Gold mineral / coin deposits in the cave walls (matching reference image!)
        if ((x * 3 + y * 7) % 9 === 0) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px + 10, py + 12, 6, 5);
          ctx.fillRect(px + 16, py + 16, 7, 6);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(px + 12, py + 14, 3, 3);
        }
      }
    }

    // 2. Draw Dug Dark Charcoal Tunnels
    // Generate paths connecting accounts
    accounts.forEach((acc, idx) => {
      const nextAcc = accounts[(idx + 1) % accounts.length];
      const startX = acc.gridX * TILE_SIZE + TILE_SIZE / 2;
      const startY = acc.gridY * TILE_SIZE + TILE_SIZE / 2;
      const endX = nextAcc.gridX * TILE_SIZE + TILE_SIZE / 2;
      const endY = nextAcc.gridY * TILE_SIZE + TILE_SIZE / 2;

      // Draw horizontal segment
      ctx.fillStyle = '#1c181b';
      const minX = Math.min(startX, endX) - TILE_SIZE / 2;
      const maxX = Math.max(startX, endX) + TILE_SIZE / 2;
      ctx.fillRect(minX, startY - TILE_SIZE / 2, maxX - minX, TILE_SIZE);

      // Draw vertical segment
      const minY = Math.min(startY, endY) - TILE_SIZE / 2;
      const maxY = Math.max(startY, endY) + TILE_SIZE / 2;
      ctx.fillRect(endX - TILE_SIZE / 2, minY, TILE_SIZE, maxY - minY);

      // Tunnel border shadows
      ctx.fillStyle = '#0d0b0d';
      ctx.fillRect(minX, startY - TILE_SIZE / 2, maxX - minX, 4);
      ctx.fillRect(minX, startY + TILE_SIZE / 2 - 4, maxX - minX, 4);
      ctx.fillRect(endX - TILE_SIZE / 2, minY, 4, maxY - minY);
      ctx.fillRect(endX + TILE_SIZE / 2 - 4, minY, 4, maxY - minY);
    });

    // 3. Draw Rocks and Boulders
    const rockLocations = [
      { x: 1, y: 1 }, { x: 7, y: 1 }, { x: 13, y: 1 },
      { x: 7, y: 5 }, { x: 1, y: 7 }, { x: 13, y: 7 },
      { x: 1, y: 10 }, { x: 7, y: 10 }, { x: 13, y: 10 }
    ];

    rockLocations.forEach(rock => {
      const rx = rock.x * TILE_SIZE;
      const ry = rock.y * TILE_SIZE;
      
      // Main rock body
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(rx + 6, ry + 10, TILE_SIZE - 12, TILE_SIZE - 18);
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(rx + 10, ry + 12, TILE_SIZE - 20, 10);
      // Highlights & shadows
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(rx + 12, ry + 14, 6, 4);
      ctx.fillStyle = '#374151';
      ctx.fillRect(rx + 8, ry + TILE_SIZE - 14, TILE_SIZE - 16, 6);
    });

    // 4. Draw Animated Money Flow along Tunnels (when tracing is active!)
    if (isTracing && activeTraceStep !== null && transactions.length > 0) {
      const currentTx = transactions[activeTraceStep % transactions.length];
      const fromAcc = accounts.find(a => a.id === currentTx.fromId);
      const toAcc = accounts.find(a => a.id === currentTx.toId);

      if (fromAcc && toAcc) {
        const fromPx = fromAcc.gridX * TILE_SIZE + TILE_SIZE / 2;
        const fromPy = fromAcc.gridY * TILE_SIZE + TILE_SIZE / 2;
        const toPx = toAcc.gridX * TILE_SIZE + TILE_SIZE / 2;
        const toPy = toAcc.gridY * TILE_SIZE + TILE_SIZE / 2;

        // Glowing connection path
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 6;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(fromPx, fromPy);
        // L-shaped tunnel path
        ctx.lineTo(toPx, fromPy);
        ctx.lineTo(toPx, toPy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Calculate moving money packet position
        let currentX = fromPx;
        let currentY = fromPy;

        if (traceProgress <= 0.5) {
          // Moving horizontally
          const subProgress = traceProgress * 2;
          currentX = fromPx + (toPx - fromPx) * subProgress;
          currentY = fromPy;
        } else {
          // Moving vertically
          const subProgress = (traceProgress - 0.5) * 2;
          currentX = toPx;
          currentY = fromPy + (toPy - fromPy) * subProgress;
        }

        // Draw glowing money packet / bag of money!
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;

        // Glow ring
        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Pixel gold money bag
        ctx.fillStyle = '#eab308';
        ctx.fillRect(currentX - 10, currentY - 8, 20, 18);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(currentX - 7, currentY - 5, 14, 12);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(currentX - 5, currentY - 11, 10, 4);

        // Money symbol
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹', currentX, currentY + 1);

        ctx.shadowBlur = 0;
      }
    }

    // 5. Draw Account Nodes (Terminals / Vaults)
    accounts.forEach(acc => {
      const ax = acc.gridX * TILE_SIZE;
      const ay = acc.gridY * TILE_SIZE;
      const isDiscovered = discoveredAccountIds.has(acc.id);
      const isCurrentTarget = nearbyAccount?.id === acc.id;

      // Vault base / terminal body
      ctx.fillStyle = isDiscovered ? '#1e293b' : '#33271e';
      ctx.fillRect(ax + 4, ay + 6, TILE_SIZE - 8, TILE_SIZE - 12);

      // Metallic trim
      ctx.fillStyle = isCurrentTarget ? '#f59e0b' : (isDiscovered ? '#38bdf8' : '#785038');
      ctx.fillRect(ax + 2, ay + 4, TILE_SIZE - 4, 3);
      ctx.fillRect(ax + 2, ay + TILE_SIZE - 8, TILE_SIZE - 4, 3);

      // Terminal screen or vault lock
      if (isDiscovered) {
        ctx.fillStyle = acc.status === 'flagged' ? '#ef4444' : (acc.status === 'suspicious' ? '#f59e0b' : '#10b981');
        ctx.fillRect(ax + 10, ay + 12, TILE_SIZE - 20, 16);

        // Blinking terminal scanlines
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ax + 14, ay + 16, 4, 3);
        ctx.fillRect(ax + 22, ay + 16, 12, 3);
        ctx.fillRect(ax + 14, ay + 22, 18, 2);
      } else {
        // Locked / Mysterious Vault
        ctx.fillStyle = '#17120e';
        ctx.fillRect(ax + 10, ay + 12, TILE_SIZE - 20, 16);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(ax + 18, ay + 16, 12, 8); // Keyhole
        ctx.fillStyle = '#000000';
        ctx.fillRect(ax + 22, ay + 18, 4, 4);
      }

      // Floating Account Label Badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(ax - 10, ay - 14, TILE_SIZE + 20, 16);
      ctx.strokeStyle = isCurrentTarget ? '#fde047' : '#9a4811';
      ctx.lineWidth = 1;
      ctx.strokeRect(ax - 10, ay - 14, TILE_SIZE + 20, 16);

      ctx.fillStyle = isCurrentTarget ? '#fde047' : '#fef3c7';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(acc.alias, ax + TILE_SIZE / 2, ay - 6);

      // Amount indicator under node
      ctx.fillStyle = '#fde047';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText(`₹${(acc.balance / 1000).toFixed(0)}k`, ax + TILE_SIZE / 2, ay + TILE_SIZE + 4);
    });

    // 6. Draw Detective Player Character (Matching Reference Image Style!)
    const ppx = playerX * TILE_SIZE + TILE_SIZE / 2;
    const ppy = playerY * TILE_SIZE + TILE_SIZE / 2;
    const bobOffset = isWalking && (walkFrame % 2 === 1) ? -2 : 0;

    // Shadow underneath player
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(ppx, ppy + 18, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player legs / Blue trousers
    ctx.fillStyle = '#1d4ed8'; // Blue pants matching image
    if (playerDir === 'left') {
      ctx.fillRect(ppx - 8, ppy + 10 + bobOffset, 6, 8);
      ctx.fillRect(ppx - 1, ppy + 10 + bobOffset, 6, 8);
    } else if (playerDir === 'right') {
      ctx.fillRect(ppx - 5, ppy + 10 + bobOffset, 6, 8);
      ctx.fillRect(ppx + 2, ppy + 10 + bobOffset, 6, 8);
    } else {
      ctx.fillRect(ppx - 7, ppy + 10 + bobOffset, 6, 8);
      ctx.fillRect(ppx + 1, ppy + 10 + bobOffset, 6, 8);
    }

    // Player Face / Head (Peach/skin tone matching reference image)
    ctx.fillStyle = '#fbbca0';
    ctx.fillRect(ppx - 10, ppy - 6 + bobOffset, 20, 16);

    // Eyes and smile
    ctx.fillStyle = '#000000';
    if (playerDir === 'left') {
      ctx.fillRect(ppx - 8, ppy - 1 + bobOffset, 3, 3);
      ctx.fillRect(ppx - 3, ppy - 1 + bobOffset, 3, 3);
      ctx.fillRect(ppx - 7, ppy + 5 + bobOffset, 4, 2); // smile
    } else if (playerDir === 'right') {
      ctx.fillRect(ppx, ppy - 1 + bobOffset, 3, 3);
      ctx.fillRect(ppx + 5, ppy - 1 + bobOffset, 3, 3);
      ctx.fillRect(ppx + 2, ppy + 5 + bobOffset, 4, 2); // smile
    } else if (playerDir === 'up') {
      // Back of head
      ctx.fillStyle = '#92400e';
      ctx.fillRect(ppx - 8, ppy - 4 + bobOffset, 16, 12);
    } else {
      // Down / Front facing
      ctx.fillRect(ppx - 6, ppy - 1 + bobOffset, 3, 3);
      ctx.fillRect(ppx + 3, ppy - 1 + bobOffset, 3, 3);
      // Smile
      ctx.fillRect(ppx - 4, ppy + 5 + bobOffset, 8, 2);
    }

    // Yellow Miner / Detective Hardhat (matching reference image!)
    ctx.fillStyle = '#fde047';
    ctx.fillRect(ppx - 12, ppy - 14 + bobOffset, 24, 8); // Hat crown
    ctx.fillRect(ppx - 15, ppy - 8 + bobOffset, 30, 4); // Hat brim
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(ppx - 12, ppy - 14 + bobOffset, 24, 2); // Hat band

    // Detective tool / Scanner / Pickaxe in hand (matching reference image!)
    ctx.fillStyle = '#475569'; // Tool head
    ctx.fillRect(ppx - 18, ppy - 4 + bobOffset, 8, 4);
    ctx.fillStyle = '#92400e'; // Tool handle
    ctx.fillRect(ppx - 15, ppy + bobOffset, 3, 12);

    // Glowing headlamp beam
    ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
    ctx.beginPath();
    let angle = Math.PI / 2;
    if (playerDir === 'up') angle = -Math.PI / 2;
    if (playerDir === 'left') angle = Math.PI;
    if (playerDir === 'right') angle = 0;

    ctx.arc(ppx, ppy + bobOffset, 45, angle - 0.5, angle + 0.5);
    ctx.lineTo(ppx, ppy + bobOffset);
    ctx.fill();

  }, [
    playerX,
    playerY,
    playerDir,
    isWalking,
    walkFrame,
    accounts,
    transactions,
    discoveredAccountIds,
    nearbyAccount,
    isTracing,
    activeTraceStep,
    traceProgress
  ]);

  // Handle click on canvas to walk or inspect
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(clickX / TILE_SIZE);
    const tileY = Math.floor(clickY / TILE_SIZE);

    // Check if clicked directly on an account
    const clickedAcc = accounts.find(a => a.gridX === tileX && a.gridY === tileY);
    if (clickedAcc) {
      sound.playClick();
      onSelectAccount(clickedAcc.id);
      return;
    }

    // Otherwise move towards target
    const clampedX = Math.max(1, Math.min(GRID_COLS - 2, tileX));
    const clampedY = Math.max(1, Math.min(GRID_ROWS - 2, tileY));

    let dir: 'up' | 'down' | 'left' | 'right' = 'down';
    if (Math.abs(clampedX - playerX) > Math.abs(clampedY - playerY)) {
      dir = clampedX > playerX ? 'right' : 'left';
    } else {
      dir = clampedY > playerY ? 'down' : 'up';
    }

    sound.playStep();
    onMovePlayer(clampedX, clampedY, dir);
  };

  // Virtual directional button press for mobile/touch
  const moveDir = (dir: 'up' | 'down' | 'left' | 'right') => {
    let nextX = playerX;
    let nextY = playerY;

    if (dir === 'up') nextY = Math.max(1, playerY - 1);
    if (dir === 'down') nextY = Math.min(GRID_ROWS - 2, playerY + 1);
    if (dir === 'left') nextX = Math.max(1, playerX - 1);
    if (dir === 'right') nextX = Math.min(GRID_COLS - 2, playerX + 1);

    sound.playStep();
    onMovePlayer(nextX, nextY, dir);
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${shakeScreen ? 'animate-shake' : ''}`}>
      {/* Interactive Canvas Container */}
      <div className="relative border-4 border-[#0a0604] bg-[#0c0704] p-1 shadow-2xl overflow-hidden rounded-none max-w-full">
        <canvas
          ref={canvasRef}
          width={GRID_COLS * TILE_SIZE}
          height={GRID_ROWS * TILE_SIZE}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer block touch-none"
          style={{ maxHeight: '68vh', objectFit: 'contain' }}
        />

        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />

        {/* Prompt when standing next to an account */}
        {nearbyAccount && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1b1008] border-3 border-[#fde047] px-4 py-2 text-center shadow-xl z-10 flex flex-col sm:flex-row items-center gap-2">
            <span className="text-yellow-300 text-xs font-pixel animate-pulse">
              [ACCOUNT FOUND: {nearbyAccount.alias}]
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onSelectAccount(nearbyAccount.id);
                }}
                className="pixel-btn bg-[#d97706] hover:bg-[#b45309] text-white text-[9px] px-2 py-1 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>INSPECT [E]</span>
              </button>
              <button
                onClick={() => {
                  sound.playWhoosh();
                  onStartTrace();
                }}
                className="pixel-btn bg-[#15803d] hover:bg-[#166534] text-[#fef08a] text-[9px] px-2 py-1 flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>TRACE MONEY</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch D-Pad & Action Controls (Crucial for Mobile, Tablet & Quick Testing) */}
      <div className="w-full max-w-xl flex items-center justify-between mt-3 px-2 py-1 bg-[#1a0f08] border-2 border-[#331c0d]">
        {/* On-Screen D-Pad */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => moveDir('up')}
            className="pixel-btn bg-[#3b2314] text-[#fde047] p-2 mb-1"
            title="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => moveDir('left')}
              className="pixel-btn bg-[#3b2314] text-[#fde047] p-2"
              title="Move Left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveDir('down')}
              className="pixel-btn bg-[#3b2314] text-[#fde047] p-2"
              title="Move Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveDir('right')}
              className="pixel-btn bg-[#3b2314] text-[#fde047] p-2"
              title="Move Right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action button: Inspect & Quick Trace */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {nearbyAccount ? (
            <button
              onClick={() => onSelectAccount(nearbyAccount.id)}
              className="pixel-btn bg-[#d97706] text-black font-bold text-xs px-3 py-2 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>INSPECT {nearbyAccount.alias}</span>
            </button>
          ) : (
            <div className="text-[9px] text-[#a8714b] font-pixel text-center px-2">
              WASD / ARROWS TO EXPLORE CAVE
            </div>
          )}

          <button
            onClick={onStartTrace}
            className="pixel-btn bg-[#16a34a] hover:bg-[#15803d] text-white text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 text-yellow-300" />
            <span>TRACE MONEY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
