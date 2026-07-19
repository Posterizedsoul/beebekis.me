import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearCache, clearAllCache } from '$lib/server/requestCache';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const prefix = body?.prefix;

		if (prefix && typeof prefix === 'string') {
			const cleared = clearCache(prefix);
			return json({ success: true, cleared, prefix });
		} else {
			clearAllCache();
			return json({ success: true, cleared: 'all' });
		}
	} catch {
		// If body parsing fails, clear everything
		clearAllCache();
		return json({ success: true, cleared: 'all' });
	}
};
