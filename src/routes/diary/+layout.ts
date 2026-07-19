import type { LayoutLoad } from './$types';
import { db } from '$lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { marked } from 'marked';
import { withCache } from '$lib/client/requestCache';

export interface DiaryEntry {
	id?: string;
	slug: string;
	title: string;
	date: string;
	description?: string;
	contentHtml?: string;
	featuredImage?: string;
}

export const load: LayoutLoad = async () => {
	try {
		return await withCache('diary:list', async () => {
			// Fetch published diary entries from Firestore
			const q = query(
				collection(db, 'diary_entries'),
				where('isPublished', '==', true),
				orderBy('date', 'desc')
			);

			const querySnapshot = await getDocs(q);

			const entries: DiaryEntry[] = await Promise.all(
				querySnapshot.docs.map(async (doc) => {
					const data = doc.data();
					// Firestore Timestamp to Date -> ISO string
					const dateObj = data.date?.toDate ? data.date.toDate() : new Date(data.date);

					// Rendered content so the list page can open entries in the popup
					// reader without a navigation round-trip
					let contentHtml = '';
					if (data.content) {
						try {
							contentHtml = await marked.parse(data.content, { breaks: true, gfm: true });
						} catch (e) {
							console.error(`Error parsing diary content for ${data.slug}:`, e);
						}
					}

					return {
						id: doc.id,
						slug: data.slug,
						title: data.title,
						date: dateObj.toISOString().split('T')[0], // YYYY-MM-DD
						description: data.description,
						contentHtml,
						featuredImage: data.featuredImage || ''
					};
				})
			);

			return {
				sortedEntries: entries
			};
		});
	} catch (err) {
		console.error('Error loading diary entries for layout:', err);
		return {
			sortedEntries: []
		};
	}
};

// Disable ISR for diary pages so new entries appear immediately
export const config = {
	isr: { expiration: 300 }
};
