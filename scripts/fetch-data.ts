/**
 * Fetches Kill Team tournament data from BCP and saves computed stats as JSON.
 * Run with: npx tsx scripts/fetch-data.ts
 */

import { fetchEvents, fetchPairings, fetchPlayers, fetchArmies } from "../src/lib/bcp-client";
import { computeFactionStats, computeMatchups } from "../src/lib/stats";
import { BcpPairing, BcpPlayer } from "../src/lib/types";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(__dirname, "..", "src", "data");

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const startDate = "2026-01-01";

  console.log(`Fetching Kill Team events since ${startDate}...`);
  const events = await fetchEvents(startDate);
  const finishedEvents = events.filter(
    (e) => e.ended && e.totalPlayers >= 8 && !e.teamEvent
  );
  console.log(
    `Found ${events.length} events, ${finishedEvents.length} finished with 8+ players`
  );

  // Fetch armies list
  console.log("Fetching Kill Team armies...");
  const armies = await fetchArmies();
  console.log(`Found ${armies.length} kill teams`);

  // Fetch pairings and players for each event
  const allPairings: BcpPairing[] = [];
  const allPlayers: BcpPlayer[] = [];

  for (let i = 0; i < finishedEvents.length; i++) {
    const event = finishedEvents[i];
    console.log(
      `[${i + 1}/${finishedEvents.length}] ${event.name} (${event.totalPlayers} players)...`
    );

    try {
      const [pairings, players] = await Promise.all([
        fetchPairings(event.id),
        fetchPlayers(event.id),
      ]);
      // Tag each pairing/player with event date for Q1/Q2 filtering
      for (const p of pairings) {
        (p as any).eventDate = event.eventDate;
      }
      for (const p of players) {
        (p as any).eventDate = event.eventDate;
      }
      allPairings.push(...pairings);
      allPlayers.push(...players);
    } catch (err) {
      console.error(`  Error fetching ${event.name}: ${err}`);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(
    `\nTotal: ${allPairings.length} pairings, ${allPlayers.length} players`
  );

  // Split by quarter: Q1 = Jan 1 - Apr 30, Q2 = May 1+
  const Q1_END = "2026-05-01T00:00:00.000Z";

  const q1Pairings = allPairings.filter((p: any) => p.eventDate < Q1_END);
  const q2Pairings = allPairings.filter((p: any) => p.eventDate >= Q1_END);
  const q1Players = allPlayers.filter((p: any) => p.eventDate < Q1_END);
  const q2Players = allPlayers.filter((p: any) => p.eventDate >= Q1_END);
  const q1Events = finishedEvents.filter((e) => e.eventDate < Q1_END);
  const q2Events = finishedEvents.filter((e) => e.eventDate >= Q1_END);

  console.log(`Q1: ${q1Pairings.length} pairings, ${q1Players.length} players, ${q1Events.length} events`);
  console.log(`Q2: ${q2Pairings.length} pairings, ${q2Players.length} players, ${q2Events.length} events`);

  // Compute stats for each period
  function buildStats(pairings: BcpPairing[], players: BcpPlayer[], events: typeof finishedEvents, label: string) {
    console.log(`Computing ${label} faction stats...`);
    const factionStats = computeFactionStats(pairings, players);
    console.log(`Computing ${label} matchups...`);
    const matchups = computeMatchups(pairings);
    return {
      eventsCount: events.length,
      totalPairings: pairings.length,
      totalPlayers: players.length,
      factionStats,
      matchups: matchups.filter((m) => m.totalGames >= 2),
    };
  }

  const allStats = buildStats(allPairings, allPlayers, finishedEvents, "All");
  const q1Stats = buildStats(q1Pairings, q1Players, q1Events, "Q1");
  const q2Stats = buildStats(q2Pairings, q2Players, q2Events, "Q2");

  const output = {
    generatedAt: new Date().toISOString(),
    period: { start: startDate, end: new Date().toISOString().split("T")[0] },
    armies: armies.map((a) => a.name).sort(),
    all: allStats,
    q1: q1Stats,
    q2: q2Stats,
  };

  const outPath = join(DATA_DIR, "kt-stats.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nData saved to ${outPath}`);

  // Print top 10 factions
  console.log("\n--- Top 10 Kill Teams by Win Rate (All, min 10 games) ---");
  allStats.factionStats
    .filter((s) => s.gamesPlayed >= 10)
    .slice(0, 10)
    .forEach((s, i) => {
      console.log(
        `${i + 1}. ${s.factionName}: ${(s.winRate * 100).toFixed(1)}% WR (${s.gamesPlayed} games, ${(s.pickRate * 100).toFixed(1)}% pick rate)`
      );
    });
}

main().catch(console.error);
