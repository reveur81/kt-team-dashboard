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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {factions.map((f) => {
          const isSelected = selected.includes(f.factionName);
          const disabled = !isSelected && selected.length >= maxSelections;
          return (
            <button
              key={f.factionName}
              onClick={() => onToggle(f.factionName)}
              disabled={disabled}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium text-left transition-all
                ${
                  isSelected
                    ? "bg-amber-600 text-white ring-2 ring-amber-400"
                    : disabled
                      ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                      : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                }
              `}
            >
              <div className="truncate">{f.factionName}</div>
              <div className="text-xs mt-0.5 opacity-70">
                {(f.winRate * 100).toFixed(1)}% WR &middot; {f.gamesPlayed}g
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
