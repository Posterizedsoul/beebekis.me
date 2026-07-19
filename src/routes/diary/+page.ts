import type { PageLoad } from './$types';

// Define the shape of diary entry metadata
interface DiaryEntry {
	id?: string;
	slug: string;
	title: string;
	date: string;
	description?: string;
}

// Define the shape of the grouped diary entries object
interface GroupedDiaries {
	[year: number]: DiaryEntry[];
}

// Reuse data already loaded by +layout.server.ts to avoid duplicate Firestore queries
export const load: PageLoad = async ({ parent }) => {
	// Get data from parent layout (already fetched from Firestore)
	const { sortedEntries } = await parent();

	// Group entries by year
	const groupedDiaries: GroupedDiaries = sortedEntries.reduce(
		(acc: GroupedDiaries, entry: DiaryEntry) => {
			const year = new Date(entry.date).getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(entry);
			return acc;
		},
		{} as GroupedDiaries
	);

	return {
		groupedDiaries,
		sortedEntries
	};
};

// Disable ISR for this page so new entries appear immediately
export const config = {
	isr: false
};
