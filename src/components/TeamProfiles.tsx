"use client";

import { FactionStats } from "@/lib/types";

interface Props {
  teamStats: FactionStats[];
}

const PROFILES: Record<
  string,
  { icon: string; color: string; bg: string; border: string; desc: string }
> = {
  // WR élevé
  Dominante: {
    icon: "👑",
    color: "text-green-300",
    bg: "bg-green-900/30",
    border: "border-green-700",
    desc: "Gagne souvent, gagne large, perd de peu",
  },
  Bulldozer: {
    icon: "🔨",
    color: "text-orange-300",
    bg: "bg-orange-900/30",
    border: "border-orange-700",
    desc: "Gagne souvent et écrase, mais s'effondre en défaite",
  },
  "Contrôleuse": {
    icon: "🎯",
    color: "text-blue-300",
    bg: "bg-blue-900/30",
    border: "border-blue-700",
    desc: "Gagne souvent, matchs serrés, très stable",
  },
  Chanceuse: {
    icon: "🎲",
    color: "text-yellow-300",
    bg: "bg-yellow-900/30",
    border: "border-yellow-700",
    desc: "Gagne souvent de justesse, s'effondre en défaite",
  },
  // WR moyen
  Explosive: {
    icon: "💥",
    color: "text-orange-300",
    bg: "bg-orange-900/20",
    border: "border-orange-800",
    desc: "50/50 mais toujours des blowouts",
  },
  Solide: {
    icon: "💎",
    color: "text-emerald-300",
    bg: "bg-emerald-900/30",
    border: "border-emerald-700",
    desc: "50/50 mais gagne large et perd de peu, bon pour le différentiel",
  },
  "Défensive": {
    icon: "🔒",
    color: "text-sky-300",
    bg: "bg-sky-900/30",
    border: "border-sky-700",
    desc: "50/50 avec des matchs serrés, stable",
  },
  "Délicate": {
    icon: "⚡",
    color: "text-amber-300",
    bg: "bg-amber-900/30",
    border: "border-amber-700",
    desc: "50/50 mais gagne de justesse et s'effondre en défaite",
  },
  // WR faible
  "Résistante": {
    icon: "🛡️",
    color: "text-teal-300",
    bg: "bg-teal-900/30",
    border: "border-teal-700",
    desc: "Perd souvent mais limite la casse, écrase quand elle gagne",
  },
  Kamikaze: {
    icon: "💀",
    color: "text-red-300",
    bg: "bg-red-900/20",
    border: "border-red-800",
    desc: "Perd souvent, tout est explosif",
  },
  Tenace: {
    icon: "✊",
    color: "text-cyan-300",
    bg: "bg-cyan-900/30",
    border: "border-cyan-700",
    desc: "Perd souvent mais toujours de peu, ne lâche rien",
  },
  Fragile: {
    icon: "💔",
    color: "text-red-400",
    bg: "bg-red-900/30",
    border: "border-red-700",
    desc: "Perd souvent et s'effondre, risquée pour l'équipe",
  },
};

const DEFAULT_PROFILE = {
  icon: "❓",
  color: "text-neutral-300",
  bg: "bg-neutral-800",
  border: "border-neutral-700",
  desc: "",
};

function marginWinColor(v: number): string {
  if (v > 7.4) return "text-green-400";
  if (v >= 6.9) return "text-yellow-300";
  return "text-red-400";
}

function marginLossColor(v: number): string {
  const abs = Math.abs(v);
  if (abs < 6.9) return "text-green-400";
  if (abs <= 7.5) return "text-yellow-300";
  return "text-red-400";
}

export default function TeamProfiles({ teamStats }: Props) {
  if (teamStats.length === 0) return null;

  // Volatilité = moyenne de (margeV + |margeD|) par KT
  const avgVolatility =
    teamStats.reduce((sum, f) => {
      return sum + f.avgMarginWin + Math.abs(f.avgMarginLoss);
    }, 0) / teamStats.length;

  // Seuils de volatilité
  const volLabel =
    avgVolatility >= 15 ? "Explosive" : avgVolatility >= 14 ? "Moyenne" : "Serrée";
  const volColor =
    avgVolatility >= 15
      ? "text-red-400"
      : avgVolatility >= 14
        ? "text-yellow-300"
        : "text-green-400";

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold">Profils de points</h2>
        <div className="text-right">
          <div className={`text-2xl font-bold ${volColor}`}>
            {avgVolatility.toFixed(1)}
          </div>
          <div className="text-[10px] text-neutral-400">
            Volatilité · {volLabel}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {teamStats.map((f) => {
          const p = PROFILES[f.profile] || DEFAULT_PROFILE;

          return (
            <div
              key={f.factionName}
              className={`rounded-lg px-4 py-3 border ${p.border} ${p.bg}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-base">{f.factionName}</div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${p.color} ${p.bg}`}
                >
                  <span className="text-base">{p.icon}</span>
                  {f.profile}
                </div>
              </div>
              <div className="text-xs text-neutral-400 mb-3">{p.desc}</div>
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wide">
                    Win Rate
                  </div>
                  <div className="font-bold text-lg">
                    {(f.winRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wide">
                    Marge Victoire
                  </div>
                  <div
                    className={`font-bold text-lg ${marginWinColor(f.avgMarginWin)}`}
                  >
                    +{f.avgMarginWin.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wide">
                    Marge Défaite
                  </div>
                  <div
                    className={`font-bold text-lg ${marginLossColor(f.avgMarginLoss)}`}
                  >
                    {f.avgMarginLoss.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-800 text-[10px] text-neutral-500">
        <span className="text-green-400">■</span> Marge V haute &gt;7.4 · D fiable &lt;6.9
        &nbsp;&nbsp;
        <span className="text-yellow-300">■</span> Moyenne V 6.9–7.4 · D 6.9–7.5
        &nbsp;&nbsp;
        <span className="text-red-400">■</span> Marge V basse &lt;6.9 · D fragile &gt;7.5
      </div>
    </div>
  );
}
