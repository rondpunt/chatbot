import { createClient } from "redis";

import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { isProductionEnvironment } from "@/lib/constants";
import { ChatbotError } from "@/lib/errors";

const MAX_MESSAGES = entitlementsByUserType.guest.maxMessagesPerHour;
const WINDOW_MS = 60 * 60 * 1000;

let client: ReturnType<typeof createClient> | null = null;

const memoryHits = new Map<string, number[]>();

function pruneMemoryWindow(ip: string, now: number): number[] {
  const windowStart = now - WINDOW_MS;
  const recent = (memoryHits.get(ip) ?? []).filter(
    (timestamp) => timestamp > windowStart
  );
  memoryHits.set(ip, recent);
  return recent;
}

function enforceMemoryRateLimit(ip: string): void {
  const now = Date.now();
  const recent = pruneMemoryWindow(ip, now);

  if (recent.length >= MAX_MESSAGES) {
    throw new ChatbotError("rate_limit:chat");
  }

  recent.push(now);
  memoryHits.set(ip, recent);
}

function getClient() {
  if (!client && process.env.REDIS_URL) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", () => undefined);
    client.connect().catch(() => {
      client = null;
    });
  }
  return client;
}

async function enforceRedisRateLimit(ip: string): Promise<boolean> {
  const redis = getClient();

  if (!redis?.isReady) {
    return false;
  }

  const key = `ip-rate-limit:${ip}`;
  const results = await redis
    .multi()
    .incr(key)
    .expire(key, WINDOW_MS / 1000, "NX")
    .exec();

  const count = results?.[0];

  if (typeof count === "number" && count > MAX_MESSAGES) {
    throw new ChatbotError("rate_limit:chat");
  }

  return true;
}

export async function checkIpRateLimit(ip: string | undefined) {
  if (!isProductionEnvironment || !ip) {
    return;
  }

  try {
    const usedRedis = await enforceRedisRateLimit(ip);
    if (usedRedis) {
      return;
    }
  } catch (error) {
    if (error instanceof ChatbotError) {
      throw error;
    }
  }

  enforceMemoryRateLimit(ip);
}
