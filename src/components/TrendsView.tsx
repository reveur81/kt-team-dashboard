"use client";

import { useState, useMemo } from "react";
import { Tournament } from "@/lib/types";

interface Props {
  tournaments: Tournament[];
}

interface Signal {
  country: string;
  faction: string;
  localRate: number;
  globalRate: number;
  ratio: number;
  localCount: number;
  countryTotal: number;
}

interface CountryDetail {
  faction: string;
  count: number;
  localRate: number;
  globalRate: number;
  ratio: number;
}

const FLAG_MAP: Record<string, string> = {
  USA: "🇺🇸", UK: "🇬🇧", Spain: "🇪🇸", France: "🇫🇷", Germany: "🇩🇪",
  Italy: "🇮🇹", Poland: "🇵🇱", Canada: "🇨🇦", Australia: "🇦🇺", Mexico: "🇲🇽",
  Denmark: "🇩🇰", Turkey: "🇹🇷", Netherlands: "🇳🇱", Portugal: "🇵🇹",
  Czechia: "🇨🇿", Sweden: "🇸🇪", Norway: "🇳🇴", Finland: "🇫🇮",
  Ireland: "🇮🇪", Hungary: "🇭🇺", Serbia: "🇷🇸", Slovakia: "🇸🇰",
  Switzerland: "🇨🇭", Ukraine: "🇺🇦", Russia: "🇷🇺", Japan: "🇯🇵",
  China: "🇨🇳", Philippines: "🇵🇭", Singapore: "🇸🇬", Indonesia: "🇮🇩",
  Thailand: "🇹🇭", Israel: "🇮🇱", "Hong Kong": "🇭🇰", "South Africa": "🇿🇦",
  "New Zealand": "🇳🇿", Argentina: "🇦🇷", Chile: "🇨🇱", Colombia: "🇨🇴",
  Ecuador: "🇪🇨", Peru: "🇵🇪", Venezuela: "🇻🇪", Brazil: "🇧🇷",
  "El Salvador": "🇸🇻", "Puerto Rico": "🇵🇷", Malta: "🇲🇹",
};

type Period = "all" | "q2";

export default function TrendsView({ tournaments }: Props) {
  const [period, setPeriod] = useState<Period>("q2");
  const [minPlayers, setMinPlayers] = useState(15);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const { signals, countryStats, globalPicks, globalTotal } = useMemo(() => {
    const filtered = tournaments.filter((t) => {
      if (period === "q2" && t.date < "2026-05-01") return false;
      return true;
    });

    const countryPicks: Record<string, Record<string, number>> = {};
    const countryTotalPlayers: Record<string, number> = {};
    const countryTournaments: Record<string, number> = {};
    const gPicks: Record<string, number> = {};
    let gTotal = 0;

    for (const t of filtered) {
      const country = t.country;
      if (!country) continue;

      if (!countryTournaments[country]) countryTournaments[country] = 0;
      countryTournaments[country]++;

      for (const s of t.standings) {
        if (!s.f || s.f === "Unknown") continue;
        if (!countryPicks[country]) countryPicks[country] = {};
        countryPicks[country][s.f] = (countryPicks[country][s.f] || 0) + 1;
        countryTotalPlayers[country] = (countryTotalPlayers[country] || 0) + 1;
        gPicks[s.f] = (gPicks[s.f] || 0) + 1;
        gTotal++;
      }
    }

    // Build signals
    const sigs: Signal[] = [];
    for (const [country, factions] of Object.entries(countryPicks)) {
      const total = countryTotalPlayers[country];
      if (total < minPlayers) continue;

      for (const [faction, count] of Object.entries(factions)) {
        if (count < 3) continue;
        const localRate = count / total;
        const globalRate = (gPicks[faction] || 0) / gTotal;
        if (globalRate === 0) continue;
        const ratio = localRate / globalRate;
        if (ratio >= 1.8) {
          sigs.push({ country, faction, localRate, globalRate, ratio, localCount: count, countryTotal: total });
        }
      }
    }
    sigs.sort((a, b) => b.ratio - a.ratio);

    // Build country stats for deep dive
    const cStats: Record<string, { total: number; tournois: number; factions: CountryDetail[] }> = {};
    for (const [country, factions] of Object.entries(countryPicks)) {
      const total = countryTotalPlayers[country];
      if (total < minPlayers) continue;
      const details: CountryDetail[] = Object.entries(factions)
        .map(([faction, count]) => {
          const localRate = count / total;
          const globalRate = (gPicks[faction] || 0) / gTotal;
          return { faction, count, localRate, globalRate, ratio: globalRate > 0 ? localRate / globalRate : 0 };
        })
        .sort((a, b) => b.count - a.count);
      cStats[country] = { total, tournois: countryTournaments[country] || 0, factions: details };
    }

    return { signals: sigs, countryStats: cStats, globalPicks: gPicks, globalTotal: gTotal };
  }, [tournaments, period, minPlayers]);

  const sortedCountries = useMemo(() => {
    return Object.entries(countryStats)
      .sort((a, b) => b[1].total - a[1].total);
  }, [countryStats]);

  const selectedData = selectedCountry ? countryStats[selectedCountry] : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
            {(["q2", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setSelectedCountry(null); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {p === "q2" ? "Q2 (Mai+)" : "Toute l'année"}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Min. joueurs par pays : {minPlayers}
            </label>
            <input
              type="range"
              min={5}
              max={50}
              value={minPlayers}
              onChange={(e) => { setMinPlayers(Number(e.target.value)); setSelectedCountry(null); }}
              className="w-40 accent-amber-500"
            />
          </div>
          <div className="text-sm text-neutral-400">
            {sortedCountries.length} pays · {signals.length} signaux
          </div>
        </div>
      </div>

      {/* Signals */}
      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
        <h2 className="text-lg font-bold mb-1">Signaux — Surreprésentation par pays</h2>
        <p className="text-xs text-neutral-400 mb-4">
          Factions avec un pick rate local ≥ 1.8x le pick rate mondial (min. 3 picks, {minPlayers}+ joueurs dans le pays).
        </p>

        {signals.length === 0 ? (
          <p className="text-neutral-500 text-sm">Aucun signal détecté avec ces filtres.</p>
        ) : (
          <div className="space-y-1.5">
            {signals.map((s, i) => {
              const flag = FLAG_MAP[s.country] || "";
              const barWidth = Math.min(s.ratio / 5 * 100, 100);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedCountry(s.country)}
                  className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                    selectedCountry === s.country
                      ? "bg-amber-900/30 border border-amber-700"
                      : "bg-neutral-800/50 border border-transparent hover:bg-neutral-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{flag}</span>
                      <span className="font-medium text-sm">{s.country}</span>
                      <span className="text-amber-400 text-sm font-bold">{s.faction}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-neutral-400">
                        {(s.localRate * 100).toFixed(1)}% vs {(s.globalRate * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-neutral-500">
                        ({s.localCount}/{s.countryTotal})
                      </span>
                      <div className="w-16 bg-neutral-700 rounded-full h-1.5 hidden sm:block">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${
                        s.ratio >= 3 ? "text-red-400" : s.ratio >= 2 ? "text-amber-400" : "text-yellow-300"
                      }`}>
                        {s.ratio.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Country list */}
      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
        <h2 className="text-lg font-bold mb-3">Pays</h2>
        <div className="flex flex-wrap gap-2">
          {sortedCountries.map(([country, data]) => {
            const flag = FLAG_MAP[country] || "";
            const isSelected = selectedCountry === country;
            return (
              <button
                key={country}
                onClick={() => setSelectedCountry(isSelected ? null : country)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                  isSelected
                    ? "bg-amber-600 text-white border-amber-400"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                }`}
              >
                {flag} {country} <span className="text-neutral-500 text-xs">{data.total}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep dive */}
      {selectedCountry && selectedData && (
        <div className="bg-neutral-900 rounded-xl p-5 border border-amber-900/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {FLAG_MAP[selectedCountry] || ""} {selectedCountry}
            </h2>
            <div className="text-sm text-neutral-400">
              {selectedData.total} joueurs · {selectedData.tournois} tournois
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-500 border-b border-neutral-700 text-xs">
                  <th className="text-left py-1.5 px-2">Faction</th>
                  <th className="text-center py-1.5 px-2">Picks</th>
                  <th className="text-center py-1.5 px-2">Local</th>
                  <th className="text-center py-1.5 px-2">Mondial</th>
                  <th className="text-center py-1.5 px-2">Ratio</th>
                  <th className="text-left py-1.5 px-2 w-32">Écart</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.factions.map((f) => {
                  const barWidth = Math.min(f.ratio / 4 * 100, 100);
                  const barColor = f.ratio >= 1.8 ? "bg-amber-500" : f.ratio <= 0.5 ? "bg-blue-500" : "bg-neutral-500";
                  return (
                    <tr
                      key={f.faction}
                      className={`border-b border-neutral-800/50 ${
                        f.ratio >= 1.8 ? "bg-amber-900/10" : f.ratio <= 0.5 ? "bg-blue-900/10" : ""
                      }`}
                    >
                      <td className="py-1.5 px-2 font-medium">{f.faction}</td>
                      <td className="py-1.5 px-2 text-center text-neutral-400">{f.count}</td>
                      <td className="py-1.5 px-2 text-center">
                        {(f.localRate * 100).toFixed(1)}%
                      </td>
                      <td className="py-1.5 px-2 text-center text-neutral-500">
                        {(f.globalRate * 100).toFixed(1)}%
                      </td>
                      <td className={`py-1.5 px-2 text-center font-bold ${
                        f.ratio >= 1.8 ? "text-amber-400" : f.ratio <= 0.5 ? "text-blue-400" : "text-neutral-400"
                      }`}>
                        {f.ratio.toFixed(1)}x
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="w-full bg-neutral-700 rounded-full h-1.5">
                          <div
                            className={`${barColor} h-1.5 rounded-full`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-neutral-500">
            <span className="text-amber-400">■</span> Surreprésenté (≥1.8x)
            &nbsp;&nbsp;
            <span className="text-blue-400">■</span> Sous-représenté (≤0.5x)
            &nbsp;&nbsp;
            <span className="text-neutral-500">■</span> Normal
          </div>
        </div>
      )}
    </div>
  );
}
