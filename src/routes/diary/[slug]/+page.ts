import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Define expected metadata shape (can be shared if needed)
interface DiaryMetadata {
	title: string;
	date: string;
	description?: string;
	[key: string]: any;
}

export const load: PageLoad = async ({ params }) => {
	const { slug } = params;
	try {
		// Dynamically import the specific diary entry's module from /src/lib/diary
		// Note the relative path adjustment
		const diaryModule = await import(`../../../lib/diary/${slug}/+page.md`);

		// Ensure the module and its default export (the component) exist
		if (!diaryModule || !diaryModule.default) {
			console.error(`Diary module or default export not found for slug: ${slug}`);
			error(404, `Diary entry not found: ${slug}`);
		}

		// Extract metadata, providing defaults
		const metadata = (diaryModule.metadata ?? {
			title: 'Untitled Entry',
			date: '',
		}) as DiaryMetadata;

		const content = diaryModule.default;

		// Basic validation after extraction
		if (!metadata.title || !metadata.date) {
			console.warn(`Invalid metadata for diary entry: ${slug}`, metadata);
			// might still want to render the content, or throw an error but it works ig..
		}

		// Return the content component and metadata for the page
		return {
			content,
			metadata,
			slug // Pass slug for potential use in the page component
		};
	} catch (e) {
		console.error(`Error loading diary entry ${slug}:`, e);
		// Throw a 404 if the import fails (likely entry doesn't exist)
		error(404, `Diary entry not found: ${slug}`);
	}
};
