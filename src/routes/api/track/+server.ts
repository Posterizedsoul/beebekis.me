import type { RequestHandler } from './$types';
import { getAdminDb } from '$lib/server/firebaseAdmin';

/**
 * Analytics ingest.
 *
 * Clients cannot write to Firestore directly — `analytics_events` denies all
 * client writes in the security rules, so the public Firebase config in the
 * browser bundle grants zero write access. This endpoint is the only writer,
 * and it validates everything before touching the database.
 *
 * Deliberately stores no IP address, no cookie, and no fingerprint: only the
 * path, UTM tags, referrer host, and a coarse device class. Nothing here is
 * personal data, so the site needs no consent banner.
 */

const MAX_BODY_BYTES = 1024;
const RATE_LIMIT = 30; // requests per IP per window
const WINDOW_MS = 60_000;

// ponytail: per-instance in-memory limiter — resets on cold start and isn't
// shared across regions. Enough to blunt casual abuse; move to Redis/KV if a
// determined flood ever shows up in the numbers.
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
	const now = Date.now();
	const entry = hits.get(key);

	if (!entry || now > entry.resetAt) {
		hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
		// Opportunistic cleanup so the map cannot grow without bound
		if (hits.size > 5000) {
			for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
		}
		return false;
	}

	entry.count += 1;
	return entry.count > RATE_LIMIT;
}

/** Strip control characters and trim to a safe length. */

function clean(value: unknown, max: number): string {
	if (typeof value !== 'string') return '';
	// Keep printable characters only (drops control chars without
	// embedding any in this source file).
	let result = '';
	for (const ch of value) {
		const code = ch.charCodeAt(0);
		if (code >= 32 && code !== 127) result += ch;
		if (result.length >= max) break;
	}
	return result.slice(0, max);
}

/** UTM values are identifiers, not free text — keep them tight. */
function cleanTag(value: unknown): string {
	return clean(value, 64)
		.toLowerCase()
		.replace(/[^a-z0-9_-]/g, '');
}

function deviceClass(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
	if (/iPad|Tablet/i.test(userAgent)) return 'tablet';
	if (/Mobi|Android|iPhone/i.test(userAgent)) return 'mobile';
	return 'desktop';
}

const BOT_PATTERN = /bot|crawler|spider|crawling|preview|headless|lighthouse|monitor/i;

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	// Reject anything that isn't a same-origin call from this site.
	const origin = request.headers.get('origin');
	if (origin && origin !== url.origin) {
		return new Response(null, { status: 403 });
	}

	const userAgent = request.headers.get('user-agent') ?? '';
	// Never bill a bot as a human visit.
	if (!userAgent || BOT_PATTERN.test(userAgent)) {
		return new Response(null, { status: 204 });
	}

	// Rate limit per IP. The address is used only as an ephemeral in-memory
	// key — it is never written to the database.
	let clientKey = 'unknown';
	try {
		clientKey = getClientAddress();
	} catch {
		// address unavailable in some runtimes; fall through
	}
	if (isRateLimited(clientKey)) {
		return new Response(null, { status: 429 });
	}

	const rawBody = await request.text();
	if (rawBody.length > MAX_BODY_BYTES) {
		return new Response(null, { status: 413 });
	}

	let payload: Record<string, unknown>;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		return new Response(null, { status: 400 });
	}

	const path = clean(payload.path, 200);
	if (!path.startsWith('/')) {
		return new Response(null, { status: 400 });
	}
	// Never record the admin area.
	if (path.startsWith('/admin')) {
		return new Response(null, { status: 204 });
	}

	// Store only the referrer's host, not the full URL (which can carry
	// search terms or other incidental personal data).
	let referrerHost = '';
	const referrer = clean(payload.referrer, 300);
	if (referrer) {
		try {
			const parsed = new URL(referrer);
			referrerHost = parsed.host === url.host ? '' : parsed.host.slice(0, 100);
		} catch {
			referrerHost = '';
		}
	}

	const db = getAdminDb();
	// Not configured yet — accept and drop so the site never errors on it.
	if (!db) return new Response(null, { status: 204 });

	try {
		await db.collection('analytics_events').add({
			path,
			utmSource: cleanTag(payload.utmSource),
			utmMedium: cleanTag(payload.utmMedium),
			utmCampaign: cleanTag(payload.utmCampaign),
			referrerHost,
			device: deviceClass(userAgent),
			ts: new Date()
		});
	} catch (err) {
		console.error('[track] write failed:', err);
	}

	return new Response(null, { status: 204 });
};
