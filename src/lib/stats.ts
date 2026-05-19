import { BcpPairing, BcpPlayer, FactionStats, Matchup, MatchupMatrixRow } from "./types";

interface GameRecord {
  faction1: string;
  faction2: string;
  faction1Score: number;
  faction2Score: number;
  faction1CritOps: number;
  faction2CritOps: number;
  faction1KillOps: number;
  faction2KillOps: number;
  faction1TacOps: number;
  faction2TacOps: number;
  // 2 = win, 1 = draw, 0 = loss
  faction1Result: number;
  faction2Result: number;
}

function parsePairingToGame(pairing: BcpPairing): GameRecord | null {
  const meta = pairing.metaData;
  if (!meta) return null;

  const f1 = pairing.player1?.faction?.name || pairing.player1?.army?.name;
  const f2 = pairing.player2?.faction?.name || pairing.player2?.army?.name;
  if (!f1 || !f2) return null;

  const r1 = Number(meta["p1-gameResult"]);
  const r2 = Number(meta["p2-gameResult"]);
  if (isNaN(r1) || isNaN(r2)) return null;

  return {
    faction1: f1,
    faction2: f2,
    faction1Score: Number(meta["p1-gamePoints"]) || 0,
    faction2Score: Number(meta["p2-gamePoints"]) || 0,
    faction1CritOps: Number(meta["p1-critops"]) || 0,
    faction2CritOps: Number(meta["p2-critops"]) || 0,
    faction1KillOps: Number(meta["p1-killops"]) || 0,
    faction2KillOps: Number(meta["p2-killops"]) || 0,
    faction1TacOps: Number(meta["p1-tacops"]) || 0,
    faction2TacOps: Number(meta["p2-tacops"]) || 0,
    faction1Result: r1,
    faction2Result: r2,
  };
}

export function computeFactionStats(
  pairings: BcpPairing[],
  players: BcpPlayer[]
): FactionStats[] {
  const games: GameRecord[] = [];
  for (const p of pairings) {
    if (!p.isDone) continue;
    const g = parsePairingToGame(p);
    if (g) games.push(g);
  }

  const totalPlayers = players.filter((p) => !p.dropped).length;

  // Count players per faction
  const factionPlayerCount: Record<string, number> = {};
  for (const p of players) {
    if (p.dropped) continue;
    const fname = p.faction?.name;
    if (fname) {
      factionPlayerCount[fname] = (factionPlayerCount[fname] || 0) + 1;
    }
  }

  // Aggregate per faction
  const factionData: Record<
    string,
    {
      wins: number;
      losses: number;
      draws: number;
      totalScore: number;
      totalCritOps: number;
      totalKillOps: number;
      totalTacOps: number;
      games: number;
      totalMarginWin: number;
      totalMarginLoss: number;
      winsCount: number;
      lossesCount: number;
      totalScoreInWin: number;
      totalScoreInLoss: number;
      totalOppScoreInWin: number;
      totalOppScoreInLoss: number;
    }
  > = {};

  function ensure(name: string) {
    if (!factionData[name]) {
      factionData[name] = {
        wins: 0,
        losses: 0,
        draws: 0,
        totalScore: 0,
        totalCritOps: 0,
        totalKillOps: 0,
        totalTacOps: 0,
        games: 0,
        totalMarginWin: 0,
        totalMarginLoss: 0,
        winsCount: 0,
        lossesCount: 0,
        totalScoreInWin: 0,
        totalScoreInLoss: 0,
        totalOppScoreInWin: 0,
        totalOppScoreInLoss: 0,
      };
    }
  }

  for (const g of games) {
    // Exclure les matchups miroir
    if (g.faction1 === g.faction2) continue;

    ensure(g.faction1);
    ensure(g.faction2);

    const d1 = factionData[g.faction1];
    const d2 = factionData[g.faction2];

    d1.games++;
    d2.games++;

    d1.totalScore += g.faction1Score;
    d2.totalScore += g.faction2Score;
    d1.totalCritOps += g.faction1CritOps;
    d2.totalCritOps += g.faction2CritOps;
    d1.totalKillOps += g.faction1KillOps;
    d2.totalKillOps += g.faction2KillOps;
    d1.totalTacOps += g.faction1TacOps;
    d2.totalTacOps += g.faction2TacOps;

    const margin1 = g.faction1Score - g.faction2Score;
    const margin2 = g.faction2Score - g.faction1Score;

    if (g.faction1Result === 2) {
      d1.wins++;
      d1.totalMarginWin += margin1;
      d1.winsCount++;
      d1.totalScoreInWin += g.faction1Score;
      d1.totalOppScoreInWin += g.faction2Score;
      d2.losses++;
      d2.totalMarginLoss += margin2;
      d2.lossesCount++;
      d2.totalScoreInLoss += g.faction2Score;
      d2.totalOppScoreInLoss += g.faction1Score;
    } else if (g.faction2Result === 2) {
      d2.wins++;
      d2.totalMarginWin += margin2;
      d2.winsCount++;
      d2.totalScoreInWin += g.faction2Score;
      d2.totalOppScoreInWin += g.faction1Score;
      d1.losses++;
      d1.totalMarginLoss += margin1;
      d1.lossesCount++;
      d1.totalScoreInLoss += g.faction1Score;
      d1.totalOppScoreInLoss += g.faction2Score;
    } else {
      d1.draws++;
      d2.draws++;
    }
  }

  // Seuils pour les profils (médiane dynamique)
  const allMarginWins: number[] = [];
  const allMarginLosses: number[] = [];
  for (const d of Object.values(factionData)) {
    if (d.winsCount > 0) allMarginWins.push(d.totalMarginWin / d.winsCount);
    if (d.lossesCount > 0) allMarginLosses.push(Math.abs(d.totalMarginLoss / d.lossesCount));
  }
  const medianMarginWin = median(allMarginWins);
  const medianMarginLoss = median(allMarginLosses);

  function getProfile(wr: number, marginWin: number, marginLoss: number): string {
    const highWR = wr >= 0.55;
    const lowWR = wr < 0.48;
    const highMarginW = marginWin >= medianMarginWin;
    const highMarginL = Math.abs(marginLoss) >= medianMarginLoss;

    if (highWR && highMarginW && !highMarginL) return "Dominante";
    if (highWR && highMarginW && highMarginL) return "Bulldozer";
    if (highWR && !highMarginW && !highMarginL) return "Contrôleuse";
    if (highWR && !highMarginW && highMarginL) return "Chanceuse";
    if (lowWR && highMarginW && !highMarginL) return "Résistante";
    if (lowWR && !highMarginW && !highMarginL) return "Bouclier";
    if (lowWR && highMarginW && highMarginL) return "Kamikaze";
    if (lowWR && !highMarginW && highMarginL) return "Fragile";
    if (highMarginW && highMarginL) return "Explosive";
    return "Équilibrée";
  }

  return Object.entries(factionData)
    .map(([name, d]) => {
      const wr = (d.wins + d.losses) > 0 ? d.wins / (d.wins + d.losses) : 0;
      const avgMarginWin = d.winsCount > 0 ? d.totalMarginWin / d.winsCount : 0;
      const avgMarginLoss = d.lossesCount > 0 ? d.totalMarginLoss / d.lossesCount : 0;
      return {
        factionName: name,
        gamesPlayed: d.games,
        wins: d.wins,
        losses: d.losses,
        draws: d.draws,
        winRate: wr,
        avgScore: d.games > 0 ? d.totalScore / d.games : 0,
        avgCritOps: d.games > 0 ? d.totalCritOps / d.games : 0,
        avgKillOps: d.games > 0 ? d.totalKillOps / d.games : 0,
        avgTacOps: d.games > 0 ? d.totalTacOps / d.games : 0,
        pickRate: totalPlayers > 0 ? (factionPlayerCount[name] || 0) / totalPlayers : 0,
        avgMarginWin,
        avgMarginLoss,
        avgScoreInWin: d.winsCount > 0 ? d.totalScoreInWin / d.winsCount : 0,
        avgScoreInLoss: d.lossesCount > 0 ? d.totalScoreInLoss / d.lossesCount : 0,
        avgOppScoreInWin: d.winsCount > 0 ? d.totalOppScoreInWin / d.winsCount : 0,
        avgOppScoreInLoss: d.lossesCount > 0 ? d.totalOppScoreInLoss / d.lossesCount : 0,
        profile: getProfile(wr, avgMarginWin, avgMarginLoss),
      };
    })
    .sort((a, b) => b.winRate - a.winRate);
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeMatchups(pairings: BcpPairing[]): Matchup[] {
  const matchupKey = (a: string, b: string) =>
    [a, b].sort().join(" vs ");

  const matchupData: Record<
    string,
    { f1: string; f2: string; f1Wins: number; f2Wins: number; draws: number }
  > = {};

  for (const p of pairings) {
    if (!p.isDone) continue;
    const g = parsePairingToGame(p);
    if (!g) continue;

    // Exclure les matchups miroir (même faction vs même faction)
    if (g.faction1 === g.faction2) continue;

    const [sorted1, sorted2] = [g.faction1, g.faction2].sort();
    const key = matchupKey(g.faction1, g.faction2);

    if (!matchupData[key]) {
      matchupData[key] = {
        f1: sorted1,
        f2: sorted2,
        f1Wins: 0,
        f2Wins: 0,
        draws: 0,
      };
    }

    const d = matchupData[key];

    if (g.faction1Result === 2) {
      if (g.faction1 === sorted1) d.f1Wins++;
      else d.f2Wins++;
    } else if (g.faction2Result === 2) {
      if (g.faction2 === sorted1) d.f1Wins++;
      else d.f2Wins++;
    } else {
      d.draws++;
    }
  }

  return Object.values(matchupData).map((d) => {
    const total = d.f1Wins + d.f2Wins + d.draws;
    const decisive = d.f1Wins + d.f2Wins;
    return {
      faction1: d.f1,
      faction2: d.f2,
      faction1Wins: d.f1Wins,
      faction2Wins: d.f2Wins,
      draws: d.draws,
      totalGames: total,
      faction1WinRate: decisive > 0 ? d.f1Wins / decisive : 0.5,
    };
  });
}

export function analyzeTeam(
  selectedFactions: string[],
  allFactionStats: FactionStats[],
  allMatchups: Matchup[]
) {
  const teamStats = allFactionStats.filter((s) =>
    selectedFactions.includes(s.factionName)
  );

  // Find matchups involving team factions
  const relevantMatchups = allMatchups.filter(
    (m) =>
      selectedFactions.includes(m.faction1) ||
      selectedFactions.includes(m.faction2)
  );

  // Weak matchups: opponent factions that beat team factions often
  const weakMatchups = relevantMatchups
    .filter((m) => {
      if (m.totalGames < 3) return false;
      const teamFaction = selectedFactions.includes(m.faction1)
        ? m.faction1
        : m.faction2;
      const teamWinRate =
        teamFaction === m.faction1 ? m.faction1WinRate : 1 - m.faction1WinRate;
      return teamWinRate < 0.45;
    })
    .sort((a, b) => {
      const aRate = selectedFactions.includes(a.faction1)
        ? a.faction1WinRate
        : 1 - a.faction1WinRate;
      const bRate = selectedFactions.includes(b.faction1)
        ? b.faction1WinRate
        : 1 - b.faction1WinRate;
      return aRate - bRate;
    });

  const strongMatchups = relevantMatchups
    .filter((m) => {
      if (m.totalGames < 3) return false;
      const teamFaction = selectedFactions.includes(m.faction1)
        ? m.faction1
        : m.faction2;
      const teamWinRate =
        teamFaction === m.faction1 ? m.faction1WinRate : 1 - m.faction1WinRate;
      return teamWinRate > 0.55;
    })
    .sort((a, b) => {
      const aRate = selectedFactions.includes(a.faction1)
        ? 1 - a.faction1WinRate
        : a.faction1WinRate;
      const bRate = selectedFactions.includes(b.faction1)
        ? 1 - b.faction1WinRate
        : b.faction1WinRate;
      return aRate - bRate;
    });

  // Threat factions: factions that have >55% winrate against N+ team members
  const threatCount: Record<string, number> = {};
  for (const m of relevantMatchups) {
    if (m.totalGames < 3) continue;
    const isF1Team = selectedFactions.includes(m.faction1);
    const opponent = isF1Team ? m.faction2 : m.faction1;
    const opponentWinRate = isF1Team ? 1 - m.faction1WinRate : m.faction1WinRate;
    if (opponentWinRate > 0.55) {
      threatCount[opponent] = (threatCount[opponent] || 0) + 1;
    }
  }

  const dangerousFactions = Object.entries(threatCount)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);

  const threatFactions = Object.entries(threatCount)
    .filter(([, count]) => count >= 2 && count < 3)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);

  // Coverage: what % of meta factions does the team have a positive matchup against
  const metaFactions = allFactionStats
    .filter((s) => s.gamesPlayed >= 10)
    .map((s) => s.factionName);

  const coveredFactions = new Set<string>();
  for (const m of relevantMatchups) {
    if (m.totalGames < 3) continue;
    const isF1Team = selectedFactions.includes(m.faction1);
    const teamWinRate = isF1Team ? m.faction1WinRate : 1 - m.faction1WinRate;
    const opponent = isF1Team ? m.faction2 : m.faction1;
    if (teamWinRate > 0.5 && metaFactions.includes(opponent)) {
      coveredFactions.add(opponent);
    }
  }

  const coverageScore =
    metaFactions.length > 0 ? coveredFactions.size / metaFactions.length : 0;

  // Build matchup matrix: for each opponent faction, winrate of each team faction
  const matchupMatrix: MatchupMatrixRow[] = [];
  const allOpponents = new Set<string>();
  for (const m of allMatchups) {
    if (m.totalGames < 2) continue;
    if (selectedFactions.includes(m.faction1)) allOpponents.add(m.faction2);
    if (selectedFactions.includes(m.faction2)) allOpponents.add(m.faction1);
  }

  for (const opponent of allOpponents) {
    const row: MatchupMatrixRow = {
      opponent,
      winRates: {},
      avgWinRate: 0,
    };
    let sum = 0;
    let count = 0;
    for (const teamFaction of selectedFactions) {
      const m = allMatchups.find(
        (mu) =>
          (mu.faction1 === teamFaction && mu.faction2 === opponent) ||
          (mu.faction1 === opponent && mu.faction2 === teamFaction)
      );
      if (m && m.totalGames >= 2) {
        const wr =
          m.faction1 === teamFaction ? m.faction1WinRate : 1 - m.faction1WinRate;
        row.winRates[teamFaction] = { winRate: wr, games: m.totalGames };
        sum += wr;
        count++;
      }
    }
    row.avgWinRate = count > 0 ? sum / count : 0.5;
    matchupMatrix.push(row);
  }

  matchupMatrix.sort((a, b) => a.avgWinRate - b.avgWinRate);

  return {
    factionStats: teamStats,
    weakMatchups,
    strongMatchups,
    coverageScore,
    dangerousFactions,
    threatFactions,
    matchupMatrix,
  };
}
