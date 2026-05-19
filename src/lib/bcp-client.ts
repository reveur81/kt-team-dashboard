import { BcpEvent, BcpPairing, BcpArmy, BcpPlayer } from "./types";

const BASE_URL = "https://newprod-api.bestcoastpairings.com/v1";
const CLIENT_ID = "web-app";
const KILL_TEAM_GAME_TYPE = 26;

interface BcpResponse<T> {
  data: T[];
  nextKey?: string;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function bcpFetch<T>(
  path: string,
  params: Record<string, string | number>,
  retries = 3
): Promise<BcpResponse<T>> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, String(v))
  );

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: {
          "client-id": CLIENT_ID,
          Accept: "application/json",
        },
      });

      if (res.status === 429 || res.status === 409) {
        const wait = Math.min(2000 * Math.pow(2, attempt), 30000);
        console.warn(`  Rate limited (${res.status}), waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`BCP API error ${res.status}: ${body}`);
      }

      return (await res.json()) as BcpResponse<T>;
    } catch (err) {
      if (attempt < retries) {
        const wait = 1000 * Math.pow(2, attempt);
        console.warn(
          `  Retry ${attempt + 1}/${retries} after error, waiting ${wait}ms...`
        );
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Failed after ${retries} retries`);
}

async function fetchAllPages<T>(
  path: string,
  params: Record<string, string | number>,
  maxPages = 50
): Promise<T[]> {
  const all: T[] = [];
  let nextKey: string | undefined;
  let page = 0;

  do {
    const p = { ...params, limit: 99 } as Record<string, string | number>;
    if (nextKey) p.nextKey = nextKey;

    const res = await bcpFetch<T>(path, p);
    if (!res.data || res.data.length === 0) break;
    all.push(...res.data);
    nextKey = res.nextKey;
    page++;
  } while (nextKey && page < maxPages);

  return all;
}

export async function fetchEvents(
  startDate: string,
  endDate?: string
): Promise<BcpEvent[]> {
  const params: Record<string, string | number> = {
    gameType: KILL_TEAM_GAME_TYPE,
    startDate,
  };
  if (endDate) params.endDate = endDate;

  return fetchAllPages<BcpEvent>("/events", params);
}

export async function fetchPlayers(eventId: string): Promise<BcpPlayer[]> {
  return fetchAllPages<BcpPlayer>("/players", { eventId });
}

export async function fetchPairings(eventId: string): Promise<BcpPairing[]> {
  return fetchAllPages<BcpPairing>("/pairings", {
    eventId,
    pairingType: "Pairing",
  });
}

export async function fetchArmies(): Promise<BcpArmy[]> {
  const res = await bcpFetch<BcpArmy>("/armies", {
    gameType: KILL_TEAM_GAME_TYPE,
    limit: 99,
  });
  return res.data;
}
