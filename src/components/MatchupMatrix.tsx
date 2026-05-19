"use client";

import { MatchupMatrixRow } from "@/lib/types";

interface Props {
  matrix: MatchupMatrixRow[];
  selectedFactions: string[];
}

function wrColor(wr: number): string {
  if (wr >= 0.55) return "bg-green-700/60 text-green-200";
  if (wr >= 0.50) return "bg-green-900/40 text-green-300";
  if (wr >= 0.45) return "bg-orange-900/40 text-orange-300";
  return "bg-red-900/50 text-red-300";
}

function avgColor(wr: number): string {
  if (wr >= 0.55) return "text-green-400 font-bold";
  if (wr >= 0.50) return "text-green-300";
  if (wr >= 0.45) return "text-orange-300";
  return "text-red-400 font-bold";
}

export default function MatchupMatrix({ matrix, selectedFactions }: Props) {
  if (matrix.length === 0 || selectedFactions.length === 0) return null;

  // Shorten faction names for column headers
  const shortName = (name: string) =>
    name.length > 12 ? name.slice(0, 11) + "…" : name;

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-lg font-bold mb-2">Matchup Matrix</h2>
      <p className="text-xs text-neutral-400 mb-4">
        Win rate de tes KT (colonnes) contre chaque KT adverse (lignes). Classé
        par difficulté croissante.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="text-left py-2 px-2 text-neutral-400 sticky left-0 bg-neutral-900 z-10">
                vs
              </th>
              {selectedFactions.map((f) => (
                <th
                  key={f}
                  className="py-2 px-2 text-center text-neutral-300 min-w-[80px]"
                  title={f}
                >
                  {shortName(f)}
                </th>
              ))}
              <th className="py-2 px-2 text-center text-neutral-300 border-l border-neutral-700">
                Moy.
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr
                key={row.opponent}
                className="border-b border-neutral-800 hover:bg-neutral-800/30"
              >
                <td className="py-1.5 px-2 font-medium sticky left-0 bg-neutral-900 z-10 whitespace-nowrap">
                  {row.opponent}
                </td>
                {selectedFactions.map((f) => {
                  const data = row.winRates[f];
                  if (!data) {
                    return (
                      <td
                        key={f}
                        className="py-1.5 px-2 text-center text-neutral-600"
                      >
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={f} className="py-1.5 px-1 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${wrColor(data.winRate)}`}
                        title={`${data.games} matchs`}
                      >
                        {(data.winRate * 100).toFixed(0)}%
                      </span>
                    </td>
                  );
                })}
                <td className="py-1.5 px-2 text-center border-l border-neutral-700">
                  <span className={avgColor(row.avgWinRate)}>
                    {(row.avgWinRate * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
