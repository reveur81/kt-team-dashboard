"use client";

import { useState, useMemo } from "react";
import ktData from "@/data/kt-stats.json";
import { FactionStats, Matchup } from "@/lib/types";
import { analyzeTeam } from "@/lib/stats";
import FactionPicker from "@/components/FactionPicker";
import TeamSummary from "@/components/TeamSummary";
import MatchupMatrix from "@/components/MatchupMatrix";
import BattleSimulator from "@/components/BattleSimulator";
import MetaOverview from "@/components/MetaOverview";

const TEAM_SIZE = 5;

type Quarter = "all" | "q1" | "q2";

interface PeriodData {
  eventsCount: number;
  totalPairings: number;
  totalPlayers: number;
  factionStats: FactionStats[];
  matchups: Matchup[];
}

const hasQuarters = "q1" in ktData;

function getPeriodData(quarter: Quarter): PeriodData {
  const src = hasQuarters ? (ktData as any)[quarter] : ktData;
  return {
    eventsCount: src.eventsCount,
    totalPairings: src.totalPairings,
    totalPlayers: src.totalPlayers,
    factionStats: (src.factionStats as FactionStats[]).filter(
      (f) => !f.factionName.toLowerCase().includes("deleted")
    ),
    matchups: (src.matchups as Matchup[]).filter(
      (m) =>
        !m.faction1.toLowerCase().includes("deleted") &&
        !m.faction2.toLowerCase().includes("deleted")
    ),
  };
}

const QUARTER_LABELS: Record<Quarter, string> = {
  all: "Tout",
  q1: "Q1 (Jan–Avr)",
  q2: "Q2 (Mai+)",
};

type Tab = "team" | "simulator" | "meta";

export default function Home() {
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("team");
  const [quarter, setQuarter] = useState<Quarter>("all");

  const periodData = useMemo(() => getPeriodData(quarter), [quarter]);

  const handleToggle = (faction: string) => {
    setSelected((prev) =>
      prev.includes(faction)
        ? prev.filter((f) => f !== faction)
        : prev.length < TEAM_SIZE
          ? [...prev, faction]
          : prev
    );
  };

  const analysis = useMemo(() => {
    if (selected.length === 0) {
      return {
        factionStats: [],
        weakMatchups: [],
        strongMatchups: [],
        coverageScore: 0,
        dangerousFactions: [],
        threatFactions: [],
        matchupMatrix: [],
      };
    }
    return analyzeTeam(selected, periodData.factionStats, periodData.matchups);
  }, [selected, periodData]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          <span className="text-amber-400">KT</span> Team Dashboard
        </h1>
        <p className="text-neutral-400 mt-1">
          Prépare ton équipe de {TEAM_SIZE} pour un tournoi Kill Team.
          <span className="text-neutral-500 ml-2">
            {periodData.eventsCount} tournois &middot;{" "}
            {periodData.totalPairings.toLocaleString()} matchs &middot;{" "}
            {(ktData as any).period?.start} → {(ktData as any).period?.end}
          </span>
        </p>
      </header>

      {/* Tabs + Quarter filter */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-2">
          {(
            [
              ["team", "Team Builder"],
              ["simulator", "Simulateur"],
              ["meta", "Méta"],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                tab === t
                  ? "bg-amber-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {hasQuarters && (
          <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
            {(Object.keys(QUARTER_LABELS) as Quarter[]).map((q) => (
              <button
                key={q}
                onClick={() => setQuarter(q)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  quarter === q
                    ? "bg-neutral-600 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {QUARTER_LABELS[q]}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "meta" && (
        <MetaOverview factionStats={periodData.factionStats} />
      )}

      {tab === "team" && (
        <div className="space-y-6">
          <FactionPicker
            factions={periodData.factionStats}
            selected={selected}
            onToggle={handleToggle}
            maxSelections={TEAM_SIZE}
          />

          {selected.length > 0 && (
            <>
              <TeamSummary
                teamStats={analysis.factionStats}
                coverageScore={analysis.coverageScore}
                dangerousFactions={analysis.dangerousFactions}
                threatFactions={analysis.threatFactions}
              />

              <MatchupMatrix
                matrix={analysis.matchupMatrix}
                selectedFactions={selected}
              />
            </>
          )}
        </div>
      )}

      {tab === "simulator" && (
        <div className="space-y-6">
          {selected.length === 0 ? (
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <p className="text-neutral-400">
                Va dans &quot;Team Builder&quot; pour sélectionner tes 5 kill
                teams d&apos;abord.
              </p>
            </div>
          ) : (
            <BattleSimulator
              factionStats={periodData.factionStats}
              matchups={periodData.matchups}
              myTeam={selected}
            />
          )}
        </div>
      )}
    </main>
  );
}
