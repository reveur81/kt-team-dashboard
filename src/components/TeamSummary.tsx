"use client";

import { FactionStats } from "@/lib/types";

interface Props {
  teamStats: FactionStats[];
  coverageScore: number;
  dangerousFactions: string[];
  threatFactions: string[];
}

export default function TeamSummary({
  teamStats,
  coverageScore,
  dangerousFactions,
  threatFactions,
}: Props) {
  if (teamStats.length === 0) {
    return (
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
        <h2 className="text-lg font-bold mb-2">Résumé d&apos;équipe</h2>
        <p className="text-neutral-500">
          Sélectionne des kill teams pour voir l&apos;analyse
        </p>
      </div>
    );
  }

  const avgWinRate =
    teamStats.reduce((s, f) => s + f.winRate, 0) / teamStats.length;
  const avgScore =
    teamStats.reduce((s, f) => s + f.avgScore, 0) / teamStats.length;

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-lg font-bold mb-4">Résumé d&apos;équipe</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">
            {(avgWinRate * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-neutral-400">Win Rate moyen</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {avgScore.toFixed(1)}
          </div>
          <div className="text-xs text-neutral-400">Score moyen</div>
        </div>
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${coverageScore > 0.6 ? "text-green-400" : coverageScore > 0.4 ? "text-yellow-400" : "text-red-400"}`}
          >
            {(coverageScore * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-neutral-400">Couverture méta</div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {teamStats.map((f) => (
          <div
            key={f.factionName}
            className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-2"
          >
            <span className="font-medium">{f.factionName}</span>
            <div className="flex gap-4 text-sm text-neutral-400">
              <span>
                <span className="text-white font-medium">
                  {(f.winRate * 100).toFixed(1)}%
                </span>{" "}
                WR
              </span>
              <span>{f.gamesPlayed} matchs</span>
              <span>
                {f.avgCritOps.toFixed(1)} / {f.avgKillOps.toFixed(1)} /{" "}
                {f.avgTacOps.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {dangerousFactions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-red-500 mb-2">
            ⚠ KT dangereuses
          </h3>
          <p className="text-xs text-neutral-400 mb-2">
            Win rate &gt;55% contre 3+ de tes kill teams
          </p>
          <div className="flex flex-wrap gap-2">
            {dangerousFactions.map((f) => (
              <span
                key={f}
                className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-sm font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {threatFactions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-orange-400 mb-2">
            KT menaçantes
          </h3>
          <p className="text-xs text-neutral-400 mb-2">
            Win rate &gt;55% contre 2 de tes kill teams
          </p>
          <div className="flex flex-wrap gap-2">
            {threatFactions.map((f) => (
              <span
                key={f}
                className="px-2 py-1 bg-orange-900/40 text-orange-300 rounded text-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
