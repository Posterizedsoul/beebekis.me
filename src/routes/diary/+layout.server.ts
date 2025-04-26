import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

interface DiaryMetadata {
	title: string;
	date: string;
	[key: string]: any; 
}

export interface DiaryEntry {
	slug: string;
	title: string;
	date: string;
}

export const load: LayoutServerLoad = async () => {
	try {
		const diaryFiles = import.meta.glob('/src/lib/diary/*/+page.md');

		const entries: DiaryEntry[] = await Promise.all(
			Object.entries(diaryFiles).map(async ([path, resolver]) => {
				const slugMatch = path.match(/\/lib\/diary\/([^/]+)\/\+page\.md$/);
				if (!slugMatch || !slugMatch[1]) {
					console.warn(`Could not extract slug from diary path: ${path}`);
					return null;
				}
				const slug = slugMatch[1];

				const postModule = (await resolver()) as any; // Use 'any' for simplicity here
				const metadata = (postModule?.metadata ?? {}) as DiaryMetadata;

				if (!metadata.title || !metadata.date) {
					console.warn(`Diary entry "${slug}" is missing title or date.`);
					return null;
				}

				return {
					slug: slug,
					title: metadata.title,
					date: metadata.date
				};
			})
		);

		const validEntries = entries.filter((entry): entry is DiaryEntry => entry !== null);

		const sortedEntries = validEntries.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);

		return {
			sortedEntries
		};
	} catch (err) {
		console.error('Error loading diary entries:', err);
		error(500, 'Could not load diary entries');
	}
};
