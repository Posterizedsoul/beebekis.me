import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

// Define the expected shape of diary entry metadata
interface DiaryMetadata {
	title: string;
	date: string; // Expecting 'YYYY-MM-DD'
	edited?: string | string[]; // Optional: Last edited date(s)
	description?: string; // Short description for the index page
	excerpt?: string; // Longer excerpt for the entry page meta
	featuredImage?: string; // Optional path relative to entry's img/ folder or root-relative
	[key: string]: any; // Allow other properties
}

// Define the shape of the diary entry object we'll return
interface DiaryEntry extends DiaryMetadata {
	slug: string;
	resolvedImageUrl: string | null; // Resolved URL for the featured image
}

// Define the shape of the grouped diary entries object
interface GroupedDiaries {
	[year: number]: DiaryEntry[];
}

// Pre-fetch all featured images in each diary entry's img/ subfolder
const allImageModules = import.meta.glob(
	'/src/lib/diary/*/img/*.+(avif|gif|heif|jpeg|jpg|png|tiff|webp)',
	{ eager: true }
);

function resolveDiaryImageUrl(slug: string, filename: string): string | null {
	// Construct the key assuming filename includes 'img/' prefix or is just the filename
	// e.g., filename is 'img/photo.jpg' or 'photo.jpg', slug is 'first-entry'
	// key becomes '/src/lib/diary/first-entry/img/photo.jpg'
	const key = `/src/lib/diary/${slug}/${filename.startsWith('img/') ? '' : 'img/'}${filename}`;
	const mod = allImageModules[key] as { default: string } | undefined;
	if (mod?.default) return mod.default;

	// --- Debugging ---
	console.warn(`[Diary Index] Could not resolve "${filename}" for entry "${slug}" using key "${key}".`);
	const availableKeys = Object.keys(allImageModules);
	console.log(`[Diary Index Debug] Available image keys (${availableKeys.length}):`, availableKeys.slice(0, 10));
	// --- End Debugging ---

	return null;
}

export const load: PageServerLoad = async () => {
	try {
		// Get all diary entry markdown files
		const diaryFiles = import.meta.glob('/src/lib/diary/*/+page.md');

		const entries: DiaryEntry[] = await Promise.all(
			Object.entries(diaryFiles).map(async ([path, resolver]) => {
				// Extract slug from the path structure
				const slugMatch = path.match(/\/lib\/diary\/([^/]+)\/\+page\.md$/);
				if (!slugMatch) {
					console.warn(`Could not extract slug from path: ${path}`);
					return null; // Skip if slug extraction fails
				}
				const slug = slugMatch[1];

				// Resolve the module to get metadata
				const entryModule = (await resolver()) as any; // Cast to any for simplicity
				const metadata = (entryModule?.metadata ?? {}) as DiaryMetadata;

				// Basic validation
				if (!metadata.title || !metadata.date) {
					console.warn(`Skipping entry "${slug}" due to missing title or date.`);
					return null;
				}

				let resolvedImageUrl: string | null = null;
				if (metadata.featuredImage) {
					if (metadata.featuredImage.startsWith('/')) {
						// Root-relative path
						resolvedImageUrl = metadata.featuredImage;
					} else {
						// Attempt to resolve via Vite glob (relative to entry's img/ folder)
						const imgUrl = resolveDiaryImageUrl(slug, metadata.featuredImage);
						if (imgUrl) {
							resolvedImageUrl = imgUrl;
						} else {
							console.error(`Featured image path "${metadata.featuredImage}" for entry "${slug}" could not be resolved.`);
						}
					}
				}

				// Validate date format before creating Date object
				if (isNaN(new Date(metadata.date).getTime())) {
					console.warn(`Skipping entry "${slug}" due to invalid date format: ${metadata.date}`);
					return null;
				}

				return {
					...metadata,
					slug,
					resolvedImageUrl
				};
			})
		).then(results => results.filter((entry): entry is DiaryEntry => entry !== null)); // Filter out nulls

		// Sort entries by date, newest first
		entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
			groupedDiaries, // Keep grouped data
			sortedEntries: entries // Add the flat, sorted array
		};

	} catch (err) {
		console.error('Failed to load diary entries:', err);
		error(500, 'Failed to load diary entries');
	}
};
