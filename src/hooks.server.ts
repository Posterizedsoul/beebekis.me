import { redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

/**
 * Canonical host enforcement.
 *
 * The site is reachable on more than one hostname (the project's
 * *.vercel.app domain, the www subdomain, and any previously-used domain).
 * Serving identical content on several hosts splits search signals and lets a
 * non-canonical copy outrank the real site. A <link rel="canonical"> is only a
 * hint — a permanent redirect is definitive — so every production request on a
 * non-canonical host is 301'd to the canonical one.
 *
 * Only enforced on production deploys: preview/branch deployments and local dev
 * keep their own hostnames so they stay usable.
 */
const CANONICAL_HOST = new URL(PUBLIC_BASE_URL || 'https://bibekbhatta.com').host;

export const handle: Handle = async ({ event, resolve }) => {
	if (env.VERCEL_ENV === 'production') {
		const host = event.url.host;
		if (host && host !== CANONICAL_HOST) {
			const target = new URL(event.url);
			target.protocol = 'https:';
			target.host = CANONICAL_HOST;
			target.port = '';
			redirect(301, target.toString());
		}
	}

	return resolve(event);
};
