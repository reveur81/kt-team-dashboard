// BCP API response types

export interface BcpEvent {
  id: string;
  name: string;
  eventDate: string;
  eventEndDate?: string;
  totalPlayers: number;
  city?: string;
  country?: string;
  numberOfRounds: number;
  ended: boolean;
  teamEvent: boolean;
}

export interface BcpPlayer {
  id: string;
  eventId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  faction?: {
    id: string;
    name: string;
  };
  dropped: boolean;
}

export interface BcpPairing {
  id: string;
  eventId: string;
  round: number;
  table: number;
  isDone: boolean;
  player1: {
    id: string;
    firstName: string;
    lastName: string;
    army?: { id: string; name: string };
    faction?: { id: string; name: string };
  };
  player2: {
    id: string;
    firstName: string;
    lastName: string;
    army?: { id: string; name: string };
    faction?: { id: string; name: string };
  };
  metaData: Record<string, string | number>;
}

export interface BcpArmy {
  id: string;
  name: string;
}

// Computed stats types

export interface FactionStats {
  factionName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgScore: number;
  avgCritOps: number;
  avgKillOps: number;
  avgTacOps: number;
  pickRate: number; // % of total players using this faction
}

export interface Matchup {
  faction1: string;
  faction2: string;
  faction1Wins: number;
  faction2Wins: number;
  draws: number;
  totalGames: number;
  faction1WinRate: number;
}

export interface TeamSelection {
  players: {
    name: string;
    faction: string;
  }[];
}

export interface MatchupMatrixRow {
  opponent: string;
  winRates: Record<string, { winRate: number; games: number }>;
  avgWinRate: number;
}

export interface TeamAnalysis {
  team: TeamSelection;
  factionStats: FactionStats[];
  weakMatchups: Matchup[];
  strongMatchups: Matchup[];
  coverageScore: number;
  dangerousFactions: string[]; // >55% WR against 3+ team members
  threatFactions: string[]; // >55% WR against 2 team members
  matchupMatrix: MatchupMatrixRow[];
}
