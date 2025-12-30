import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

// Define the shape of diary entry metadata
interface DiaryEntry {
	id: string;
	slug: string;
	title: string;
	date: string; // ISO string
	description?: string;
	excerpt?: string;
	featuredImage?: string;
	resolvedImageUrl?: string | null;
	isPublished?: boolean;
}

// Define the shape of the grouped diary entries object
interface GroupedDiaries {
	[year: number]: DiaryEntry[];
}

export const load: PageServerLoad = async () => {
	try {
		console.log('Loading diary entries from Firestore...');

		// Fetch published diary entries sorted by date
		// Note: 'isPublished' filter might need a composite index in Firestore.
		// If it fails initially, we might need to create that index via clicking the link in console.
		// For development, we'll try querying all and filtering in memory if index is missing is an issue,
		// but 'where' clause is better.
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
				description: data.description,
				featuredImage: data.featuredImage,
				resolvedImageUrl: data.featuredImage || null
			};
		});

		// Group entries by year
		const groupedDiaries: GroupedDiaries = entries.reduce((acc, entry) => {
			const year = new Date(entry.date).getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(entry);
			return acc;
		}, {} as GroupedDiaries);

		return {
			groupedDiaries,
			sortedEntries: entries
		};

	} catch (err: any) {
		console.error('Failed to load diary entries:', err);
		if (err.code === 'permission-denied') {
			console.error('[Diary Loader] Permission denied. Check Firestore Security Rules.');
		} else if (err.code === 'unavailable') {
			console.error('[Diary Loader] Firestore unavailable. Check network/config.');
		} else if (err.code === 'failed-precondition') {
			console.error('[Diary Loader] Failed precondition (likely missing index):', err.message);
		}

		return {
			groupedDiaries: {},
			sortedEntries: []
		};
	}
};

// Disable ISR for this page so new entries appear immediately
export const config = {
	isr: false
};
