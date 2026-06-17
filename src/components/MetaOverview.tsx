"use client";

import { useState, Fragment } from "react";
import { FactionStats } from "@/lib/types";

interface Props {
  factionStats: FactionStats[];
}

type SortKey =
  | "winRate"
  | "gamesPlayed"
  | "pickRate"
  | "avgScore"
  | "avgCritOps"
  | "avgKillOps"
  | "avgTacOps";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "winRate", label: "Win Rate" },
  { key: "gamesPlayed", label: "Matchs" },
  { key: "pickRate", label: "Pick Rate" },
  { key: "avgScore", label: "Avg Score" },
  { key: "avgCritOps", label: "CritOps" },
  { key: "avgKillOps", label: "KillOps" },
  { key: "avgTacOps", label: "TacOps" },
];

function OpsBar({ label, my, opp }: { label: string; my: number; opp: number }) {
  const diff = my - opp;
  const max = Math.max(my, opp, 4);
  const myWidth = (my / max) * 100;
  const oppWidth = (opp / max) * 100;
  const diffColor = diff > 0.3 ? "text-green-400" : diff < -0.3 ? "text-red-400" : "text-neutral-400";

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-neutral-400 w-16">{label}</span>
        <span className={`text-xs font-bold ${diffColor}`}>
          {diff >= 0 ? "+" : ""}{diff.toFixed(1)}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 w-8">Vous</span>
          <div className="flex-1 bg-neutral-800 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${myWidth}%` }} />
          </div>
          <span className="text-xs text-white w-8 text-right">{my.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 w-8">Adv.</span>
          <div className="flex-1 bg-neutral-800 rounded-full h-2">
            <div className="bg-neutral-500 h-2 rounded-full" style={{ width: `${oppWidth}%` }} />
          </div>
          <span className="text-xs text-neutral-400 w-8 text-right">{opp.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export default function MetaOverview({ factionStats }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("winRate");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const relevant = factionStats.filter((f) => f.gamesPlayed >= 10);

  const sorted = [...relevant].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const oppKillRanked = [...relevant].sort((a, b) => (a.avgOppKillOps || 0) - (b.avgOppKillOps || 0));

  function getRank(list: FactionStats[], name: string): number {
    return list.findIndex((f) => f.factionName === name) + 1;
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? " ▲" : " ▼";
  }

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <h2 className="text-lg font-bold mb-4">Méta Kill Team</h2>
      <p className="text-xs text-neutral-400 mb-4">
        Factions avec 10+ matchs. Clique sur un titre de colonne pour trier.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-400 border-b border-neutral-700">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">Kill Team</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="text-center py-2 px-2 cursor-pointer hover:text-white select-none transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}{sortIndicator(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const isOpen = expanded === f.factionName;
              const durRank = getRank(oppKillRanked, f.factionName);
              const durTotal = oppKillRanked.length;
              return (
                <Fragment key={f.factionName}>
                  <tr
                    className={`border-b border-neutral-800 hover:bg-neutral-800/50 cursor-pointer ${isOpen ? "bg-neutral-800/60" : ""}`}
                    onClick={() => setExpanded(isOpen ? null : f.factionName)}
                  >
                    <td className="py-2 px-2 text-neutral-500">{i + 1}</td>
                    <td className="py-2 px-2 font-medium">
                      <span className="mr-1 text-neutral-600 text-xs">{isOpen ? "▾" : "▸"}</span>
                      {f.factionName}
                    </td>
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
                  {isOpen && (
                    <tr className="bg-neutral-800/40">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                          <OpsBar label="CritOps" my={f.avgCritOps} opp={f.avgOppCritOps || 0} />
                          <OpsBar label="KillOps" my={f.avgKillOps} opp={f.avgOppKillOps || 0} />
                          <OpsBar label="TacOps" my={f.avgTacOps} opp={f.avgOppTacOps || 0} />
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs text-neutral-500">Durabilité :</span>
                          <span className={`text-xs font-bold ${durRank <= 5 ? "text-green-400" : durRank <= 15 ? "text-yellow-400" : "text-red-400"}`}>
                            #{durRank}/{durTotal}
                          </span>
                          <span className="text-[10px] text-neutral-600">
                            (OppKillOps moyen : {(f.avgOppKillOps || 0).toFixed(1)} — plus bas = plus dur à tuer)
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
