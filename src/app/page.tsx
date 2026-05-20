"use client";

import { useState, useMemo } from "react";
import ktData from "@/data/kt-stats.json";
import { FactionStats, Matchup } from "@/lib/types";
import { analyzeTeam } from "@/lib/stats";
import FactionPicker from "@/components/FactionPicker";
import TeamSummary from "@/components/TeamSummary";
import TeamProfiles from "@/components/TeamProfiles";
import MatchupMatrix from "@/components/MatchupMatrix";
import BattleSimulator from "@/components/BattleSimulator";
import MetaOverview from "@/components/MetaOverview";

const TEAM_SIZE = 5;

const DECLASSIFIED_KT = [
  "Kommandos",
  "Veteran Guardsmen",
  "Novitiates",
  "Pathfinders",
  "Phobos Strike Team",
  "Corsair Voidscarred",
  "Legionary",
  "Warp Coven",
  "Wyrmblade",
  "Hunter Clade",
  "Void-Dancer Troupe",
  "Blooded",
  "Gellerpox Infected",
  "Elucidian Starstriders",
];

type Quarter = "all" | "q1" | "q2";

interface PeriodData {
  eventsCount: number;
  totalPairings: number;
  totalPlayers: number;
  factionStats: FactionStats[];
  matchups: Matchup[];
}

const hasQuarters = "q1" in ktData;

function isDeleted(name: string) {
  return name.toLowerCase().includes("deleted");
}

function getRawPeriodData(quarter: Quarter): PeriodData {
  const src = hasQuarters ? (ktData as any)[quarter] : ktData;
  return {
    eventsCount: src.eventsCount,
    totalPairings: src.totalPairings,
    totalPlayers: src.totalPlayers,
    factionStats: (src.factionStats as FactionStats[]).filter(
      (f) => !isDeleted(f.factionName)
    ),
    matchups: (src.matchups as Matchup[]).filter(
      (m) => !isDeleted(m.faction1) && !isDeleted(m.faction2)
    ),
  };
}

function filterDeclassified(data: PeriodData, show: boolean): PeriodData {
  if (show) return data;
  return {
    ...data,
    factionStats: data.factionStats.filter(
      (f) => !DECLASSIFIED_KT.includes(f.factionName)
    ),
    matchups: data.matchups.filter(
      (m) =>
        !DECLASSIFIED_KT.includes(m.faction1) &&
        !DECLASSIFIED_KT.includes(m.faction2)
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
  const [showDeclassified, setShowDeclassified] = useState(false);

  const periodData = useMemo(() => {
    const raw = getRawPeriodData(quarter);
    return filterDeclassified(raw, showDeclassified);
  }, [quarter, showDeclassified]);

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
        {(ktData as any).generatedAt && (
          <p className="text-neutral-500 text-xs mt-1">
            Données mises à jour le{" "}
            {new Date((ktData as any).generatedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </header>

      {/* Tabs + Quarter filter + Declassified toggle */}
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

        <button
          onClick={() => setShowDeclassified(!showDeclassified)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            showDeclassified
              ? "border-purple-500 bg-purple-900/30 text-purple-300"
              : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          {showDeclassified ? "Declassified visibles" : "Declassified masquées"}
        </button>
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

              <TeamProfiles teamStats={analysis.factionStats} />

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

      <footer className="mt-12 pt-4 border-t border-neutral-800 text-center text-neutral-600 text-xs">
        Version du{" "}
        {process.env.BUILD_TIMESTAMP
          ? new Date(process.env.BUILD_TIMESTAMP).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </footer>
    </main>
  );
}
