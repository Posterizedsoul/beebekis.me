import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env } from '$env/dynamic/private';

/**
 * Firebase Admin SDK — server only.
 *
 * The admin SDK bypasses Firestore security rules, which is exactly why the
 * analytics collection can be locked to `write: if false` for every client:
 * the only path that can append events is this server, behind the validated
 * /api/track endpoint.
 *
 * Requires the private env var FIREBASE_SERVICE_ACCOUNT (the service-account
 * JSON, as a single-line string). It must NOT be prefixed PUBLIC_ — that would
 * ship the private key to every browser. If it is unset, this returns null and
 * tracking degrades to a silent no-op rather than throwing.
 */
let cached: Firestore | null = null;

export function getAdminDb(): Firestore | null {
	if (cached) return cached;

	const raw = env.FIREBASE_SERVICE_ACCOUNT;
	if (!raw) return null;

	try {
		const credentials = JSON.parse(raw);
		const app = getApps().length
			? getApps()[0]
			: initializeApp({ credential: cert(credentials) }, 'analytics');
		cached = getFirestore(app);
		return cached;
	} catch (err) {
		console.error('[firebaseAdmin] Failed to initialise:', err);
		return null;
	}
}
