import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import yaml from 'js-yaml'; // Use js-yaml directly

// Define the expected shape of memoir metadata from info.md
interface MemoirMetadata {
	title: string;
	date: string;
	description?: string;
	coverImage?: string;
	images?: { filename: string; alt?: string }[];
	[key: string]: any;
}

// Type for the enhanced image module structure
interface EnhancedImageModule {
	default: {
		src: string;
		srcset: string;
		width: number;
		height: number;
		// Potentially other properties
	};
}

// Define the shape of a single gallery preview item using enhanced data
interface GalleryPreview {
	src: EnhancedImageModule['default']; // Store the enhanced object
	alt: string;
	filename: string; // Keep filename for matching/ordering
}

// Define the shape of the memoir object for the landing page
interface MemoirSummary {
	slug: string;
	title: string;
	date: string;
	description?: string;
	galleryPreviews?: GalleryPreview[]; // Use updated type
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

// Helper to read and parse frontmatter from info.md content
function parseMemoirInfo(content: string): MemoirMetadata | null {
	try {
		// Use loadAll to handle potential multiple documents, take the first one
		const documents = yaml.loadAll(content);
		if (!documents || documents.length === 0) {
			console.warn('No YAML documents found in content.');
			return null;
		}
		const frontmatter = documents[0]; // Use the first document

		if (typeof frontmatter === 'object' && frontmatter !== null) {
			return frontmatter as MemoirMetadata;
		} else {
			console.warn('First YAML document has invalid format.');
			return null;
		}
	} catch (e) {
		console.error('Error parsing YAML frontmatter:', e);
	}
	return null;
}

// Pre-fetch all image modules using import.meta.glob with enhanced query
const allImageModules = import.meta.glob(
	'/src/lib/assets/Memories/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
	{ eager: true, query: { enhanced: true } } // Use enhanced query
);
// Import raw content of info.md files
const allInfoFiles = import.meta.glob('/src/lib/assets/Memories/*/info.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

// Helper function to generate alt text from filename
function generateAltText(filename: string): string {
	if (!filename) return 'Image';
	// Remove potential leading path segments like 'img/'
	const baseFilename = filename.includes('/') ? filename.substring(filename.lastIndexOf('/') + 1) : filename;
	const nameWithoutExtension = baseFilename.substring(0, baseFilename.lastIndexOf('.')) || baseFilename;
	return nameWithoutExtension
		.replace(/[_-]/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Load function for the landing page /memories
export const load: PageServerLoad = async () => {
	const PREVIEW_IMAGE_LIMIT = 5; // Max previews per memoir on landing page
	console.log('Loading data for /memories landing page...');

	let memoirSummaries: (MemoirSummary | null)[] = [];

	try {
		memoirSummaries = await Promise.all(
			Object.entries(allInfoFiles).map(async ([filePath, fileContent]) => {
				const slugMatch = filePath.match(/\/lib\/assets\/Memories\/([^/]+)\/info\.md$/);
				if (!slugMatch || !slugMatch[1]) {
					console.warn(`Could not extract slug from path: ${filePath}`);
					return null;
				}
				const slug = slugMatch[1];

				const metadata = parseMemoirInfo(fileContent);

				if (!metadata || !metadata.title || !metadata.date || isNaN(new Date(metadata.date).getTime())) {
					console.warn(
						`Skipping directory ${slug} due to missing/invalid title or date in info.md`
					);
					return null;
				}

				// Process images using enhanced modules
				let finalPreviews: GalleryPreview[] = [];
				const imageMetaList = metadata.images || [];
				const altTextMap = new Map<string, string>();
				imageMetaList.forEach(img => {
					if (img.filename && img.alt) {
						altTextMap.set(img.filename, img.alt);
					}
				});

				// Get filenames in desired order (cover first, then others)
				let orderedFilenames: string[] = [];
				if (imageMetaList.length > 0) {
					let filenamesFromMeta = imageMetaList.map(img => img.filename);
					const coverFilename = metadata.coverImage;

					if (coverFilename && filenamesFromMeta.includes(coverFilename)) {
						// Move cover image to the front
						filenamesFromMeta = filenamesFromMeta.filter(f => f !== coverFilename);
						filenamesFromMeta.unshift(coverFilename);
					}
					orderedFilenames = filenamesFromMeta;
				} else if (metadata.coverImage) {
					// Only cover image specified
					orderedFilenames = [metadata.coverImage];
					console.warn(`[${slug}] No 'images' array in info.md, using only coverImage for preview.`);
				}

				// Resolve enhanced modules for the ordered filenames
				const resolvedPreviewsPromises = orderedFilenames.map(filename => {
					const imageGlobPath = `/src/lib/assets/Memories/${slug}/${filename}`;
					const module = allImageModules[imageGlobPath] as EnhancedImageModule | undefined;

					if (module && module.default) {
						const alt = altTextMap.get(filename) || generateAltText(filename);
						return { src: module.default, alt, filename }; // Return GalleryPreview object
					} else {
						console.warn(`[${slug}] Enhanced image module not found for preview: ${filename} at ${imageGlobPath}`);
						return null;
					}
				});

				// Filter out nulls and limit the number of previews
				finalPreviews = resolvedPreviewsPromises
					.filter((p): p is GalleryPreview => p !== null)
					.slice(0, PREVIEW_IMAGE_LIMIT);

				return {
					slug,
					title: metadata.title,
					date: metadata.date,
					description: metadata.description,
					galleryPreviews: finalPreviews // Pass enhanced previews
				};

			})
		);

		const validMemoirs = memoirSummaries
			.filter((memoir): memoir is MemoirSummary => memoir !== null)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		// Grouping logic remains the same
		const groupedMemoirs: GroupedByYear = validMemoirs.reduce((acc, memoir) => {
			const date = new Date(memoir.date);
			const year = date.getFullYear();
			const month = date.getMonth(); // 0-indexed month
			const day = date.getDate();

			if (!acc[year]) {
				acc[year] = {};
			}
			if (!acc[year][month]) {
				acc[year][month] = {};
			}
			if (!acc[year][month][day]) {
				acc[year][month][day] = [];
			}
			acc[year][month][day].push(memoir);
			return acc;
		}, {} as GroupedByYear);

		// Sorting keys logic remains the same
		const sortedKeys: SortedKeys = {
			years: Object.keys(groupedMemoirs)
				.map(Number)
				.sort((a, b) => b - a), // Sort years descending
			months: {},
			days: {}
		};

		sortedKeys.years.forEach(year => {
			sortedKeys.months[year] = Object.keys(groupedMemoirs[year])
				.map(Number)
				.sort((a, b) => b - a); // Sort months descending
			sortedKeys.days[year] = {};
			sortedKeys.months[year].forEach(month => {
				sortedKeys.days[year][month] = Object.keys(groupedMemoirs[year][month])
					.map(Number)
					.sort((a, b) => b - a); // Sort days descending
			});
		});

		console.log('Successfully loaded and grouped memoirs for landing page.');
		return {
			groupedMemoirs: groupedMemoirs,
			sortedKeys: sortedKeys
		};
	} catch (err) {
		console.error('Error loading memoirs:', err);
		error(500, 'Could not load memoirs');
	}
};