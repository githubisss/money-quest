export type AccountStatus = 'clean' | 'under_investigation' | 'suspicious' | 'flagged';

export interface AccountNode {
  id: string;
  name: string;
  alias: string;
  type: 'personal' | 'shell_corp' | 'mule' | 'crypto_exchange' | 'offshore';
  balance: number;
  received: number;
  sent: number;
  gridX: number; // Grid tile coordinate (e.g., 0-15)
  gridY: number; // Grid tile coordinate (e.g., 0-11)
  discovered: boolean;
  status: AccountStatus;
  bankName: string;
  accountNumber: string;
  jurisdiction: string;
  flagReason?: string;
  connections: number;
  lore: string;
}

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  currency: string;
  timestamp: string; // e.g. "10:02:15"
  relativeMinutes: number; // 0 to 60 for timeline scrubbing
  memo: string;
  traced: boolean;
  status: 'normal' | 'suspicious' | 'flagged';
  hash: string;
}

export interface ClueItem {
  id: string;
  title: string;
  description: string;
  relatedAccountId?: string;
  timestamp: string;
  icon: string;
  discovered: boolean;
}

export interface CaseLevel {
  id: string;
  levelNumber: number;
  code: string;
  title: string;
  subtitle: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  depth: number;
  targetAmount: number;
  description: string;
  accounts: AccountNode[];
  transactions: Transaction[];
  clues: ClueItem[];
  loopPattern: string[]; // e.g. ['ACC_A', 'ACC_B', 'ACC_C', 'ACC_D', 'ACC_A']
  whyFlagged: string[];
}

export type ScreenView = 'title' | 'game' | 'network_map' | 'load_data' | 'how_to_play';

export interface GameState {
  currentLevelIndex: number;
  activeCase: CaseLevel;
  moneyFound: number;
  accountsDiscoveredCount: number;
  suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  investigationXp: number;
  discoveredAccountIds: Set<string>;
  discoveredClueIds: Set<string>;
  inspectedAccountId: string | null;
  
  // Tracing State
  isTracing: boolean;
  traceStepIndex: number;
  traceProgress: number; // 0 to 1 between steps
  isTracePaused: boolean;
  timelineMinutes: number; // Current timeline scrubber value (e.g. 0 to 60)
  loopDiscovered: boolean;
  
  // Character coordinates on grid
  playerX: number;
  playerY: number;
  playerDir: 'up' | 'down' | 'left' | 'right';
  isWalking: boolean;

  // Modals & Overlays
  showDiscoveryAlert: boolean;
  showInvestigationReport: boolean;
  showInventory: boolean;
  inventoryTab: 'clues' | 'trails' | 'records' | 'map';
  showCaseBriefing: boolean;
  soundEnabled: boolean;
}
