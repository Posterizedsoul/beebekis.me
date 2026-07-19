import type { PageLoad } from './$types';
import { db } from '$lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { withCache } from '$lib/client/requestCache';

// Define the shape of the memoir object for the landing page
interface MemoirSummary {
	slug: string;
	title: string;
	date: string; // ISO string
	description?: string;
	galleryPreviews?: { src: string; alt: string; filename: string }[];
}

// Define the shape of the deeply grouped memoirs object
interface GroupedByDay {
	[day: number]: MemoirSummary[];
}
interface GroupedByMonth {
	[month: number]: GroupedByDay;
}
interface GroupedByYear {
	[year: number]: GroupedByMonth;
}

// Define the shape of the sorted keys object
interface SortedKeys {
	years: number[];
	months: { [year: number]: number[] };
	days: { [year: number]: { [month: number]: number[] } };
}

export const load: PageLoad = async () => {
	// Note: In a real server-side environment with Firebase client SDK,
	// we might need to use firebase-admin or ensure the client SDK uses REST properly.
	// However, since we initialized it in $lib/firebase with standard SDK, it should work
	// if polyfills are present or if running in a Node environment that supports fetch.
	// For a robust production app, often `firebase-admin` is preferred in +page.server.ts.
	// For this implementation, we'll try using the client SDK we initialized.

	try {
		return await withCache('memories:list', async () => {
			console.log('Loading memories from Firestore...');

			// Fetch all published memories sorted by date
			const q = query(
				collection(db, 'memories'),
				where('isPublished', '==', true),
				orderBy('date', 'desc')
			);

			const querySnapshot = await getDocs(q);

			const memoirs: MemoirSummary[] = querySnapshot.docs.map((doc) => {
				const data = doc.data();

				// Map Firestore data to our summary shape
				// Firestore timestamps need conversion
				const dateObj = data.date?.toDate ? data.date.toDate() : new Date(data.date);
				const dateStr = dateObj.toISOString();

				// Construct gallery previews
				// We'll take the first 5 images from the images array/subcollection
				let previews: any[] = [];
				if (data.images && Array.isArray(data.images)) {
					previews = data.images.slice(0, 5).map((img: any) => ({
						src: img.url,
						alt: img.altText || 'Memory image',
						filename: img.filename || 'image' // Fallback
					}));
				}

				return {
					slug: data.slug,
					title: data.title,
					date: dateStr,
					description: data.description,
					galleryPreviews: previews
				};
			});

			// Grouping logic (reused)
			const groupedMemoirs: GroupedByYear = memoirs.reduce((acc, memoir) => {
				const date = new Date(memoir.date);
				const year = date.getFullYear();
				const month = date.getMonth(); // 0-indexed month
				const day = date.getDate();

				if (!acc[year]) acc[year] = {};
				if (!acc[year][month]) acc[year][month] = {};
				if (!acc[year][month][day]) acc[year][month][day] = [];

				acc[year][month][day].push(memoir);
				return acc;
			}, {} as GroupedByYear);

			// Sorting keys logic (reused)
			const sortedKeys: SortedKeys = {
				years: Object.keys(groupedMemoirs)
					.map(Number)
					.sort((a, b) => b - a),
				months: {},
				days: {}
			};

			sortedKeys.years.forEach((year) => {
				sortedKeys.months[year] = Object.keys(groupedMemoirs[year])
					.map(Number)
					.sort((a, b) => b - a);
				sortedKeys.days[year] = {};
				sortedKeys.months[year].forEach((month) => {
					sortedKeys.days[year][month] = Object.keys(groupedMemoirs[year][month])
						.map(Number)
						.sort((a, b) => b - a);
				});
			});

			console.log(`[Memories Loader] Successfully loaded ${memoirs.length} memories.`);
			return {
				groupedMemoirs,
				sortedKeys
			};
		});
	} catch (err: any) {
		console.error('[Memories Loader] Error loading memoirs:', err);
		// Check for specific Firestore error codes
		if (err.code === 'permission-denied') {
			console.error('[Memories Loader] Permission denied. Check Firestore Security Rules.');
		} else if (err.code === 'unavailable') {
			console.error('[Memories Loader] Firestore unavailable. Check network/config.');
		}

		return {
			groupedMemoirs: {},
			sortedKeys: { years: [], months: {}, days: {} }
		};
	}
};

// Disable ISR for this page so new memories appear immediately
export const config = {
	isr: { expiration: 300 }
};
