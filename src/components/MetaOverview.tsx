"use client";

import { FactionStats } from "@/lib/types";

interface Props {
  factionStats: FactionStats[];
}

export default function MetaOverview({ factionStats }: Props) {
  const relevant = factionStats.filter((f) => f.gamesPlayed >= 10);

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-lg font-bold mb-4">Méta Kill Team</h2>
      <p className="text-xs text-neutral-400 mb-4">
        Factions avec 10+ matchs. CritOps / KillOps / TacOps = scores moyens
        par partie.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-400 border-b border-neutral-700">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">Kill Team</th>
              <th className="text-center py-2 px-2">Win Rate</th>
              <th className="text-center py-2 px-2">Matchs</th>
              <th className="text-center py-2 px-2">Pick Rate</th>
              <th className="text-center py-2 px-2">Avg Score</th>
              <th className="text-center py-2 px-2">CritOps</th>
              <th className="text-center py-2 px-2">KillOps</th>
              <th className="text-center py-2 px-2">TacOps</th>
            </tr>
          </thead>
          <tbody>
            {relevant.map((f, i) => (
              <tr
                key={f.factionName}
                className="border-b border-neutral-800 hover:bg-neutral-800/50"
              >
                <td className="py-2 px-2 text-neutral-500">{i + 1}</td>
                <td className="py-2 px-2 font-medium">{f.factionName}</td>
                <td className="py-2 px-2 text-center">
                  <span
                    className={`font-bold ${
                      f.winRate >= 0.55
                        ? "text-green-400"
                        : f.winRate >= 0.48
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {(f.winRate * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="py-2 px-2 text-center text-neutral-400">
                  {f.gamesPlayed}
                </td>
                <td className="py-2 px-2 text-center text-neutral-400">
                  {(f.pickRate * 100).toFixed(1)}%
                </td>
                <td className="py-2 px-2 text-center">
                  {f.avgScore.toFixed(1)}
                </td>
                <td className="py-2 px-2 text-center text-neutral-400">
                  {f.avgCritOps.toFixed(1)}
                </td>
                <td className="py-2 px-2 text-center text-neutral-400">
                  {f.avgKillOps.toFixed(1)}
                </td>
                <td className="py-2 px-2 text-center text-neutral-400">
                  {f.avgTacOps.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
