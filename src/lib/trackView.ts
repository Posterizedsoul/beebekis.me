/**
 * Fire-and-forget page-view beacon.
 *
 * Sends only the path, UTM tags, and referrer — no IP (the server never stores
 * one), no cookie, no localStorage, no fingerprint. Honours Do Not Track and
 * Global Privacy Control, and never reports the admin area.
 */
export function trackView(pathname: string, search: string): void {
	if (typeof window === 'undefined') return;

	// Respect explicit opt-outs.
	const nav = navigator as Navigator & {
		doNotTrack?: string;
		msDoNotTrack?: string;
		globalPrivacyControl?: boolean;
	};
	const dnt = nav.doNotTrack ?? nav.msDoNotTrack ?? (window as { doNotTrack?: string }).doNotTrack;
	if (dnt === '1' || dnt === 'yes' || nav.globalPrivacyControl === true) return;

	if (pathname.startsWith('/admin')) return;

	const params = new URLSearchParams(search);
	const body = JSON.stringify({
		path: pathname,
		utmSource: params.get('utm_source') ?? '',
		utmMedium: params.get('utm_medium') ?? '',
		utmCampaign: params.get('utm_campaign') ?? '',
		referrer: document.referrer ?? ''
	});

	try {
		// keepalive so the request survives the page being navigated away from
		fetch('/api/track', {
			method: 'POST',
			body,
			keepalive: true,
			headers: { 'Content-Type': 'application/json' }
		}).catch(() => {
			/* analytics must never surface an error to the visitor */
		});
	} catch {
		/* ignore */
	}
}
