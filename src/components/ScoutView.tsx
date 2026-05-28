"use client";

import { useState, useMemo } from "react";
import { Tournament } from "@/lib/types";

interface Props {
  tournaments: Tournament[];
}

export default function ScoutView({ tournaments }: Props) {
  const [minPlayers, setMinPlayers] = useState(16);
  const [search, setSearch] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tournaments.filter((t) => {
      if (t.players < minPlayers) return false;
      if (!q) return true;
      // Search in tournament name, city, country, and player names
      if (t.name.toLowerCase().includes(q)) return true;
      if (t.city.toLowerCase().includes(q)) return true;
      if (t.country.toLowerCase().includes(q)) return true;
      if (t.standings.some((s) => s.n.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [tournaments, minPlayers, search]);

  // Count unique players matching search across filtered tournaments
  const playerMatches = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return null;
    const playerMap: Record<
      string,
      { name: string; tournaments: { tName: string; date: string; faction: string; w: number; l: number; d: number }[] }
    > = {};
    for (const t of filtered) {
      for (const s of t.standings) {
        if (!s.n.toLowerCase().includes(q)) continue;
        const key = s.n.toLowerCase();
        if (!playerMap[key]) playerMap[key] = { name: s.n, tournaments: [] };
        playerMap[key].tournaments.push({
          tName: t.name,
          date: t.date,
          faction: s.f,
          w: s.w,
          l: s.l,
          d: s.d,
        });
      }
    }
    return Object.values(playerMap).sort((a, b) => b.tournaments.length - a.tournaments.length);
  }, [filtered, search]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Recherche (tournoi, ville, pays, joueur)
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setExpandedIdx(null);
              }}
              placeholder="Ex: Spain, Dallas, Joshua..."
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white w-64 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Joueurs minimum : {minPlayers}
            </label>
            <input
              type="range"
              min={8}
              max={50}
              value={minPlayers}
              onChange={(e) => {
                setMinPlayers(Number(e.target.value));
                setExpandedIdx(null);
              }}
              className="w-40 accent-amber-500"
            />
          </div>
          <div className="text-sm text-neutral-400">
            {filtered.length} tournoi{filtered.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Player search results */}
      {playerMatches && playerMatches.length > 0 && (
        <div className="bg-neutral-900 rounded-xl p-4 border border-amber-900/50">
          <h3 className="text-sm font-bold text-amber-400 mb-3">
            Joueurs trouvés ({playerMatches.length})
          </h3>
          <div className="space-y-3">
            {playerMatches.slice(0, 20).map((pm) => (
              <div key={pm.name} className="border-b border-neutral-800 pb-2">
                <div className="font-medium text-sm mb-1">{pm.name}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {pm.tournaments.map((t, i) => (
                    <div
                      key={i}
                      className="text-xs text-neutral-400 flex gap-2"
                    >
                      <span className="text-neutral-500">{t.date}</span>
                      <span className="text-amber-300">{t.faction}</span>
                      <span>
                        {t.w}W-{t.l}L-{t.d}D
                      </span>
                      <span className="text-neutral-600 truncate">
                        {t.tName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tournament list */}
      <div className="space-y-2">
        {filtered.slice(0, 50).map((t, idx) => {
          const isExpanded = expandedIdx === idx;
          // Faction distribution
          const factionCounts: Record<string, number> = {};
          for (const s of t.standings) {
            factionCounts[s.f] = (factionCounts[s.f] || 0) + 1;
          }
          const topFactions = Object.entries(factionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

          return (
            <div
              key={`${t.name}-${t.date}-${idx}`}
              className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden"
            >
              {/* Tournament header */}
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="w-full text-left px-4 py-3 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {t.date} · {t.city}{t.city && t.country ? ", " : ""}{t.country} · {t.players} joueurs · {t.rounds} rondes
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-neutral-500 hidden sm:block">
                      {topFactions.map(([f, c]) => `${f} (${c})`).join(" · ")}
                    </div>
                    <span className="text-neutral-500 text-sm">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded standings */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-neutral-800">
                  {/* Faction distribution bar */}
                  <div className="flex flex-wrap gap-2 py-3">
                    {Object.entries(factionCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([f, c]) => (
                        <span
                          key={f}
                          className="text-xs bg-neutral-800 px-2 py-0.5 rounded text-neutral-300"
                        >
                          {f}{" "}
                          <span className="text-amber-400">{c}</span>
                        </span>
                      ))}
                  </div>

                  {/* Standings table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-neutral-500 border-b border-neutral-700 text-xs">
                          <th className="text-left py-1.5 px-2">#</th>
                          <th className="text-left py-1.5 px-2">Joueur</th>
                          <th className="text-left py-1.5 px-2">Faction</th>
                          <th className="text-center py-1.5 px-2">W-L-D</th>
                          <th className="text-center py-1.5 px-2">Score</th>
                          <th className="text-center py-1.5 px-2">Diff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.standings.map((s, i) => {
                          const diff = s.s - s.os;
                          const isSearchMatch =
                            search &&
                            s.n
                              .toLowerCase()
                              .includes(search.toLowerCase().trim());
                          return (
                            <tr
                              key={i}
                              className={`border-b border-neutral-800/50 ${
                                isSearchMatch
                                  ? "bg-amber-900/20"
                                  : "hover:bg-neutral-800/30"
                              }`}
                            >
                              <td className="py-1.5 px-2 text-neutral-500">
                                {i + 1}
                              </td>
                              <td
                                className={`py-1.5 px-2 ${isSearchMatch ? "text-amber-300 font-medium" : ""}`}
                              >
                                {s.n}
                              </td>
                              <td className="py-1.5 px-2 text-neutral-300">
                                {s.f}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <span className="text-green-400">{s.w}</span>-
                                <span className="text-red-400">{s.l}</span>-
                                <span className="text-neutral-400">{s.d}</span>
                              </td>
                              <td className="py-1.5 px-2 text-center text-neutral-400">
                                {s.s}-{s.os}
                              </td>
                              <td
                                className={`py-1.5 px-2 text-center font-medium ${
                                  diff > 0
                                    ? "text-green-400"
                                    : diff < 0
                                      ? "text-red-400"
                                      : "text-neutral-400"
                                }`}
                              >
                                {diff > 0 ? "+" : ""}
                                {diff}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length > 50 && (
          <div className="text-center text-neutral-500 text-sm py-4">
            {filtered.length - 50} tournois supplémentaires non affichés. Affine ta recherche.
          </div>
        )}

        {filtered.length === 0 && (
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 text-center text-neutral-400">
            Aucun tournoi trouvé avec ces filtres.
          </div>
        )}
      </div>
    </div>
  );
}
