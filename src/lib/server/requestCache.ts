// ponytail: module-scope Map, per-server-instance only (lost on cold start) — good enough for
// warm-instance reuse on Vercel; upgrade to a shared store (Redis/KV) if that stops being enough.
const cache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/** Returns the cached value for `key` if still fresh, otherwise runs `loader` and caches the result. */
export async function withCache<T>(
	key: string,
	loader: () => Promise<T>,
	ttlMs: number = DEFAULT_TTL
): Promise<T> {
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < ttlMs) {
		return cached.data as T;
	}

	const data = await loader();
	cache.set(key, { data, timestamp: Date.now() });
	return data;
}
