"use client";

import { FactionStats } from "@/lib/types";

interface Props {
  teamStats: FactionStats[];
}

const PROFILE_STYLE: Record<string, { color: string; bg: string }> = {
  Dominante: { color: "text-green-300", bg: "bg-green-900/40" },
  Bulldozer: { color: "text-orange-300", bg: "bg-orange-900/30" },
  "Contrôleuse": { color: "text-blue-300", bg: "bg-blue-900/40" },
  Chanceuse: { color: "text-yellow-300", bg: "bg-yellow-900/30" },
  Explosive: { color: "text-orange-300", bg: "bg-orange-900/30" },
  "Équilibrée": { color: "text-neutral-300", bg: "bg-neutral-800" },
  Offensive: { color: "text-amber-300", bg: "bg-amber-900/30" },
  "Défensive": { color: "text-blue-300", bg: "bg-blue-900/30" },
  "Résistante": { color: "text-teal-300", bg: "bg-teal-900/30" },
  Kamikaze: { color: "text-red-300", bg: "bg-red-900/30" },
  Bouclier: { color: "text-cyan-300", bg: "bg-cyan-900/30" },
  Fragile: { color: "text-red-400", bg: "bg-red-900/40" },
};

const PROFILE_DESC: Record<string, string> = {
  Dominante: "Gagne souvent, gagne large, perd de peu",
  Bulldozer: "Gagne souvent et écrase, mais s'effondre en défaite",
  "Contrôleuse": "Gagne souvent, matchs serrés, très stable",
  Chanceuse: "Gagne souvent de justesse, s'effondre en défaite",
  Explosive: "50/50 mais toujours des blowouts",
  "Équilibrée": "50/50 avec des matchs serrés",
  Offensive: "Marque beaucoup, défaites contenues",
  "Défensive": "Matchs serrés, défaites contenues",
  "Résistante": "Perd souvent mais limite la casse, écrase quand elle gagne",
  Kamikaze: "Perd souvent, tout est explosif",
  Bouclier: "Perd souvent mais toujours de peu, protège le différentiel",
  Fragile: "Perd souvent et s'effondre, risquée pour l'équipe",
};

function marginColor(margin: number, isWin: boolean): string {
  if (isWin) {
    return margin >= 6 ? "text-green-400" : margin >= 3 ? "text-green-300" : "text-yellow-300";
  }
  const abs = Math.abs(margin);
  return abs <= 3 ? "text-green-300" : abs <= 6 ? "text-yellow-300" : "text-red-400";
}

export default function TeamProfiles({ teamStats }: Props) {
  if (teamStats.length === 0) return null;

  // Différentiel moyen attendu par ronde
  const avgDiff = teamStats.reduce((sum, f) => {
    const expectedMargin =
      f.winRate * f.avgMarginWin + (1 - f.winRate) * f.avgMarginLoss;
    return sum + expectedMargin;
  }, 0) / teamStats.length;

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Profils de points</h2>
        <div className="text-right">
          <div className={`text-xl font-bold ${avgDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
            {avgDiff >= 0 ? "+" : ""}{avgDiff.toFixed(1)}
          </div>
          <div className="text-[10px] text-neutral-400">Diff. moyen attendu / ronde</div>
        </div>
      </div>

      <div className="space-y-3">
        {teamStats.map((f) => {
          const style = PROFILE_STYLE[f.profile] || PROFILE_STYLE["Équilibrée"];
          const desc = PROFILE_DESC[f.profile] || "";

          return (
            <div
              key={f.factionName}
              className="bg-neutral-800 rounded-lg px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">{f.factionName}</div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${style.color} ${style.bg}`}
                >
                  {f.profile}
                </span>
              </div>
              <div className="text-[10px] text-neutral-500 mb-2">{desc}</div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-neutral-400 text-xs">WR </span>
                  <span className="font-bold">{(f.winRate * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-xs">Marge V </span>
                  <span className={`font-bold ${marginColor(f.avgMarginWin, true)}`}>
                    +{f.avgMarginWin.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-xs">Marge D </span>
                  <span className={`font-bold ${marginColor(f.avgMarginLoss, false)}`}>
                    {f.avgMarginLoss.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
