"use client";

import { FactionStats } from "@/lib/types";

interface Props {
  factions: FactionStats[];
  selected: string[];
  onToggle: (faction: string) => void;
  maxSelections: number;
}

export default function FactionPicker({
  factions,
  selected,
  onToggle,
  maxSelections,
}: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">
        Sélection d&apos;équipe ({selected.length}/{maxSelections})
      </h2>
      <p className="text-sm text-neutral-400 mb-4">
        Choisis {maxSelections} kill teams pour ton équipe
      </p>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        {[...factions].sort((a, b) => a.factionName.localeCompare(b.factionName)).map((f) => {
          const isSelected = selected.includes(f.factionName);
          const disabled = !isSelected && selected.length >= maxSelections;
          return (
            <button
              key={f.factionName}
              onClick={() => onToggle(f.factionName)}
              disabled={disabled}
              className={`
                px-2 h-[52px] rounded-lg text-sm font-medium text-left transition-colors
                border-2
                ${
                  isSelected
                    ? "bg-amber-600 text-white border-amber-400"
                    : disabled
                      ? "bg-neutral-800 text-neutral-600 border-transparent cursor-not-allowed"
                      : "bg-neutral-800 text-neutral-200 border-transparent hover:bg-neutral-700"
                }
              `}
            >
              <div className="truncate text-xs sm:text-sm leading-tight">{f.factionName}</div>
              <div className="text-[10px] sm:text-xs opacity-70 leading-tight">
                {(f.winRate * 100).toFixed(1)}% WR &middot; {f.gamesPlayed}g
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
