"use client";

import { FactionStats } from "@/lib/types";

interface Props {
  factionStats: FactionStats[];
}

const PROFILES: Record<
  string,
  { icon: string; color: string; bg: string; border: string; desc: string }
> = {
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

const PROFILE_ORDER = [
  "Dominante",
  "Bulldozer",
  "Contrôleuse",
  "Chanceuse",
  "Explosive",
  "Solide",
  "Défensive",
  "Délicate",
  "Résistante",
  "Kamikaze",
  "Tenace",
  "Fragile",
];

const TIER_LABELS: Record<string, string> = {
  Dominante: "WR élevé (≥55%)",
  Explosive: "WR moyen (48–55%)",
  "Résistante": "WR faible (<48%)",
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

export default function AllProfiles({ factionStats }: Props) {
  const relevant = factionStats.filter((f) => f.gamesPlayed >= 10);

  // Group factions by profile
  const grouped: Record<string, FactionStats[]> = {};
  for (const f of relevant) {
    const key = f.profile || "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  }
  // Sort factions within each group by WR desc
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => b.winRate - a.winRate);
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
        <h2 className="text-lg font-bold mb-1">Profils de points — Toutes les factions</h2>
        <p className="text-xs text-neutral-400 mb-6">
          Factions avec 10+ matchs, groupées par profil. Triées par win rate décroissant.
        </p>

        {PROFILE_ORDER.map((profileName) => {
          const factions = grouped[profileName];
          if (!factions || factions.length === 0) return null;
          const p = PROFILES[profileName] || DEFAULT_PROFILE;
          const tierLabel = TIER_LABELS[profileName];

          return (
            <div key={profileName} className="mb-6">
              {tierLabel && (
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 mt-2 border-b border-neutral-800 pb-1">
                  {tierLabel}
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{p.icon}</span>
                <span className={`font-bold ${p.color}`}>{profileName}</span>
                <span className="text-neutral-500 text-xs">— {p.desc}</span>
                <span className="text-neutral-600 text-xs ml-auto">{factions.length} KT</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {factions.map((f) => (
                  <div
                    key={f.factionName}
                    className={`rounded-lg px-4 py-2.5 border ${p.border} ${p.bg}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm">{f.factionName}</div>
                      <div className="text-xs text-neutral-500">{f.gamesPlayed}g</div>
                    </div>
                    <div className="flex gap-5 text-sm">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wide">WR</div>
                        <div className={`font-bold ${
                          f.winRate >= 0.55
                            ? "text-green-400"
                            : f.winRate >= 0.48
                              ? "text-yellow-300"
                              : "text-red-400"
                        }`}>
                          {(f.winRate * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wide">Marge V</div>
                        <div className={`font-bold ${marginWinColor(f.avgMarginWin)}`}>
                          +{f.avgMarginWin.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wide">Marge D</div>
                        <div className={`font-bold ${marginLossColor(f.avgMarginLoss)}`}>
                          {f.avgMarginLoss.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-4 pt-3 border-t border-neutral-800 text-[10px] text-neutral-500">
          <span className="text-green-400">■</span> Marge V haute &gt;7.4 · D fiable &lt;6.9
          &nbsp;&nbsp;
          <span className="text-yellow-300">■</span> Moyenne V 6.9–7.4 · D 6.9–7.5
          &nbsp;&nbsp;
          <span className="text-red-400">■</span> Marge V basse &lt;6.9 · D fragile &gt;7.5
        </div>
      </div>
    </div>
  );
}
