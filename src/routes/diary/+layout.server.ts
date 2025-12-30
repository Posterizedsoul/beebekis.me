import type { LayoutServerLoad } from './$types';
import { db } from '$lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

export interface DiaryEntry {
	id?: string;
	slug: string;
	title: string;
	date: string;
	description?: string;
}

export const load: LayoutServerLoad = async () => {
	try {
		// Fetch published diary entries from Firestore
		const q = query(
			collection(db, 'diary_entries'),
			where('isPublished', '==', true),
			orderBy('date', 'desc')
		);

		const querySnapshot = await getDocs(q);

		const entries: DiaryEntry[] = querySnapshot.docs.map(doc => {
			const data = doc.data();
			// Firestore Timestamp to Date -> ISO string
			const dateObj = data.date?.toDate ? data.date.toDate() : new Date(data.date);

			return {
				id: doc.id,
				slug: data.slug,
				title: data.title,
				date: dateObj.toISOString().split('T')[0], // YYYY-MM-DD
				description: data.description
			};
		});

		return {
			sortedEntries: entries
		};
	} catch (err) {
		console.error('Error loading diary entries for layout:', err);
		return {
			sortedEntries: []
		};
	}
};

// Disable ISR for diary pages so new entries appear immediately
export const config = {
	isr: false
};
