"use client";

import { useState } from "react";
import { FactionStats, Matchup } from "@/lib/types";

interface Props {
  factionStats: FactionStats[];
  matchups: Matchup[];
  myTeam: string[];
}

function getMatchupWR(
  faction1: string,
  faction2: string,
  matchups: Matchup[]
): { winRate: number; games: number } | null {
  const m = matchups.find(
    (mu) =>
      (mu.faction1 === faction1 && mu.faction2 === faction2) ||
      (mu.faction1 === faction2 && mu.faction2 === faction1)
  );
  if (!m || m.totalGames < 1) return null;
  const wr = m.faction1 === faction1 ? m.faction1WinRate : 1 - m.faction1WinRate;
  return { winRate: wr, games: m.totalGames };
}

function wrLabel(wr: number): { text: string; color: string } {
  if (wr >= 0.55) return { text: "Favorable", color: "text-green-400 bg-green-900/30" };
  if (wr >= 0.50) return { text: "Léger avantage", color: "text-green-300 bg-green-900/20" };
  if (wr >= 0.45) return { text: "Équilibré", color: "text-orange-300 bg-orange-900/20" };
  return { text: "Défavorable", color: "text-red-400 bg-red-900/30" };
}

export default function BattleSimulator({
  factionStats,
  matchups,
  myTeam,
}: Props) {
  const [opponentTeam, setOpponentTeam] = useState<string[]>([]);

  const availableFactions = factionStats
    .filter((f) => !f.factionName.toLowerCase().includes("deleted"))
    .map((f) => f.factionName)
    .sort();

  const handleToggleOpponent = (faction: string) => {
    setOpponentTeam((prev) =>
      prev.includes(faction)
        ? prev.filter((f) => f !== faction)
        : prev.length < 5
          ? [...prev, faction]
          : prev
    );
  };

  // Build matchup grid: my team (rows) vs opponent team (cols)
  const grid = myTeam.map((myFaction) => ({
    myFaction,
    matchups: opponentTeam.map((oppFaction) => ({
      oppFaction,
      ...getMatchupWR(myFaction, oppFaction, matchups),
    })),
  }));

  // Summary: for each opponent, best matchup from my team
  const bestMatchups = opponentTeam.map((opp) => {
    let best: { myFaction: string; winRate: number; games: number } | null = null;
    for (const my of myTeam) {
      const mu = getMatchupWR(my, opp, matchups);
      if (mu && (!best || mu.winRate > best.winRate)) {
        best = { myFaction: my, ...mu };
      }
    }
    return { opponent: opp, best };
  });

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-lg font-bold mb-2">Simulateur de bataille</h2>
      <p className="text-xs text-neutral-400 mb-4">
        Sélectionne les kill teams de l&apos;équipe adverse (max 5) pour voir
        les matchups.
      </p>

      {/* Opponent picker */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-neutral-300 mb-2">
          Équipe adverse ({opponentTeam.length}/5)
        </h3>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {availableFactions.map((f) => {
            const isSelected = opponentTeam.includes(f);
            const isMyTeam = myTeam.includes(f);
            const disabled =
              isMyTeam || (!isSelected && opponentTeam.length >= 5);
            return (
              <button
                key={f}
                onClick={() => handleToggleOpponent(f)}
                disabled={disabled}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-red-600 text-white ring-1 ring-red-400"
                    : disabled
                      ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matchup grid */}
      {opponentTeam.length > 0 && myTeam.length > 0 && (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-2 px-2 text-neutral-400">
                    Mon équipe ↓ / Adversaire →
                  </th>
                  {opponentTeam.map((f) => (
                    <th
                      key={f}
                      className="py-2 px-2 text-center text-red-300 min-w-[90px]"
                    >
                      {f.length > 14 ? f.slice(0, 13) + "…" : f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((row) => (
                  <tr
                    key={row.myFaction}
                    className="border-b border-neutral-800"
                  >
                    <td className="py-2 px-2 font-medium text-amber-300">
                      {row.myFaction}
                    </td>
                    {row.matchups.map((mu) => {
                      if (mu.winRate == null) {
                        return (
                          <td
                            key={mu.oppFaction}
                            className="py-2 px-2 text-center text-neutral-600"
                          >
                            —
                          </td>
                        );
                      }
                      const label = wrLabel(mu.winRate);
                      return (
                        <td key={mu.oppFaction} className="py-2 px-1 text-center">
                          <div
                            className={`rounded px-2 py-1 ${label.color}`}
                          >
                            <div className="font-bold text-sm">
                              {(mu.winRate * 100).toFixed(0)}%
                            </div>
                            <div className="text-[10px] opacity-70">
                              {label.text} ({mu.games}g)
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Best pairing suggestions */}
          <div>
            <h3 className="text-sm font-bold text-neutral-300 mb-2">
              Meilleur pairing suggéré
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {bestMatchups.map(({ opponent, best }) => {
                if (!best) {
                  return (
                    <div
                      key={opponent}
                      className="bg-neutral-800 rounded-lg px-3 py-2"
                    >
                      <span className="text-neutral-400">vs {opponent}</span>
                      <span className="text-neutral-600 ml-2">
                        Pas de données
                      </span>
                    </div>
                  );
                }
                const label = wrLabel(best.winRate);
                return (
                  <div
                    key={opponent}
                    className={`rounded-lg px-3 py-2 ${label.color}`}
                  >
                    <div className="text-xs text-neutral-400">
                      vs {opponent}
                    </div>
                    <div className="font-medium">
                      {best.myFaction}{" "}
                      <span className="font-bold">
                        {(best.winRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
