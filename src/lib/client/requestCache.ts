// Client-side module-scope Map for caching Firebase data between navigations.
// Lives for the duration of the browser session/tab.
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

/** Delete all cache entries whose key starts with `prefix`. */
export function clearCache(prefix: string): number {
	let cleared = 0;
	for (const key of cache.keys()) {
		if (key.startsWith(prefix)) {
			cache.delete(key);
			cleared++;
		}
	}
	return cleared;
}

/** Wipe the entire cache. */
export function clearAllCache(): void {
	cache.clear();
}
