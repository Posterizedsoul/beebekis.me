// A tiny localStorage flag set at login so public pages can decide whether to
// load the Firebase client SDK at all. Anonymous visitors never fetch Firebase
// just to evaluate the (hidden) admin buttons. Not a security control — the
// Firestore rules are — purely a performance gate.
const KEY = 'bb_admin';

export function isAdminHinted(): boolean {
	try {
		return localStorage.getItem(KEY) === '1';
	} catch {
		return false;
	}
}

export function setAdminHint(on: boolean): void {
	try {
		if (on) localStorage.setItem(KEY, '1');
		else localStorage.removeItem(KEY);
	} catch {
		// ignore (private mode / storage disabled)
	}
}
