"use client";

import { Matchup } from "@/lib/types";

interface Props {
  matchups: Matchup[];
  selectedFactions: string[];
  type: "weak" | "strong";
}

export default function MatchupTable({
  matchups,
  selectedFactions,
  type,
}: Props) {
  if (matchups.length === 0) {
    return null;
  }

  const title =
    type === "weak" ? "Matchups difficiles" : "Matchups favorables";
  const titleColor = type === "weak" ? "text-red-400" : "text-green-400";

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className={`text-lg font-bold mb-4 ${titleColor}`}>{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-400 border-b border-neutral-700">
              <th className="text-left py-2 px-2">Ta KT</th>
              <th className="text-left py-2 px-2">vs</th>
              <th className="text-center py-2 px-2">WR</th>
              <th className="text-center py-2 px-2">W-L-D</th>
              <th className="text-center py-2 px-2">Matchs</th>
            </tr>
          </thead>
          <tbody>
            {matchups.slice(0, 15).map((m, i) => {
              const isF1Team = selectedFactions.includes(m.faction1);
              const teamFaction = isF1Team ? m.faction1 : m.faction2;
              const opponent = isF1Team ? m.faction2 : m.faction1;
              const teamWins = isF1Team ? m.faction1Wins : m.faction2Wins;
              const teamLosses = isF1Team ? m.faction2Wins : m.faction1Wins;
              const teamWR = isF1Team
                ? m.faction1WinRate
                : 1 - m.faction1WinRate;

              return (
                <tr
                  key={i}
                  className="border-b border-neutral-800 hover:bg-neutral-800/50"
                >
                  <td className="py-2 px-2 font-medium">{teamFaction}</td>
                  <td className="py-2 px-2">{opponent}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`font-bold ${
                        teamWR >= 0.5
                          ? "text-green-400"
                          : teamWR >= 0.4
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {(teamWR * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center text-neutral-400">
                    {teamWins}-{teamLosses}-{m.draws}
                  </td>
                  <td className="py-2 px-2 text-center text-neutral-500">
                    {m.totalGames}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
