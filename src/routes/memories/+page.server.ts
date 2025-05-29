import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import yaml from 'js-yaml'; // Use js-yaml directly

// Define the expected shape of memoir metadata from info.md
interface MemoirMetadata {
	title: string;
	date: string;
	description?: string;
	coverImage?: string;
	heroImage?: string; // Added heroImage
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
	console.log('Available info.md files:', Object.keys(allInfoFiles)); // Log all found info.md paths

	let memoirSummaries: (MemoirSummary | null)[] = [];

	try {
		memoirSummaries = await Promise.all(
			Object.entries(allInfoFiles).map(async ([filePath, fileContent]) => {
				console.log(`[Memories Loader] Processing file: ${filePath}`); // Log each file path being processed

				const slugMatch = filePath.match(/\/lib\/assets\/Memories\/([^/]+)\/info\.md$/);
				let slug = "unknown_slug"; // Default slug if match fails

				if (!slugMatch || !slugMatch[1]) {
					console.warn(`[Memories Loader] Could not extract slug from path: ${filePath}`);
				} else {
					slug = slugMatch[1];
				}
				
				console.log(`[Memories Loader - ${slug}] Attempting to parse metadata.`);
				const metadata = parseMemoirInfo(fileContent);
				console.log(`[Memories Loader - ${slug}] Parsed metadata:`, JSON.stringify(metadata, null, 2));


				if (!metadata || !metadata.title || !metadata.date || isNaN(new Date(metadata.date).getTime())) {
					console.warn(
						`[Memories Loader - ${slug}] Skipping directory due to missing/invalid title or date. Date: ${metadata?.date}, Title: ${metadata?.title}`
					);
					return null;
				}

				const imageMetaFromInfo = metadata.images || []; // Ensure it's an array
				const altTextMap = new Map<string, string>();

				imageMetaFromInfo.forEach(img => {
					if (img.filename && img.alt) {
						altTextMap.set(img.filename, img.alt);
					}
				});

				// --- Start of new robust image filename collection and ordering logic ---
				let collectedFilenames: string[] = [];
				const coverImageFilename = metadata.coverImage;
				const heroImageFilename = metadata.heroImage; 

				// Always auto-discover images from the filesystem first
				const slugImagePrefix = `/src/lib/assets/Memories/${slug}/`;
				const discoveredImageFullPaths = Object.keys(allImageModules)
					.filter(path => path.startsWith(slugImagePrefix));
				
				const autoDiscoveredFilenames = discoveredImageFullPaths.map(path => path.substring(slugImagePrefix.length));
				console.log(`[Memories Loader - ${slug}] Auto-discovered filenames:`, JSON.stringify(autoDiscoveredFilenames));

				if (imageMetaFromInfo.length > 0) {
					// Case 1: Explicit 'images' array exists - use it for ordering, but include all discovered files
					const explicitFilenames = imageMetaFromInfo.map(img => img.filename).filter(Boolean);
					console.log(`[Memories Loader - ${slug}] Filenames from info.md 'images' array:`, JSON.stringify(explicitFilenames));
					
					// Start with explicit order, then add any auto-discovered files not in the explicit list
					collectedFilenames = [...explicitFilenames];
					autoDiscoveredFilenames.forEach(filename => {
						if (!collectedFilenames.includes(filename)) {
							collectedFilenames.push(filename);
						}
					});
				} else {
					// Case 2: No 'images' array - use all auto-discovered files
					collectedFilenames = autoDiscoveredFilenames;
				}

				// Ensure heroImage and coverImage are considered, even if not already included
				if (heroImageFilename && !collectedFilenames.includes(heroImageFilename)) {
					collectedFilenames.push(heroImageFilename);
				}
				if (coverImageFilename && !collectedFilenames.includes(coverImageFilename)) {
					collectedFilenames.push(coverImageFilename);
				}
				
				let uniqueFilenames = [...new Set(collectedFilenames.filter(Boolean))];
				console.log(`[Memories Loader - ${slug}] Unique filenames before ordering:`, JSON.stringify(uniqueFilenames));

				let orderedFilenames: string[] = [];
				const tempFilenames = [...uniqueFilenames]; 

				if (heroImageFilename) {
					const heroIdx = tempFilenames.indexOf(heroImageFilename);
					if (heroIdx > -1) {
						orderedFilenames.push(tempFilenames.splice(heroIdx, 1)[0]);
					}
				}

				if (coverImageFilename && coverImageFilename !== heroImageFilename) { // Avoid adding cover if it's same as hero and already added
					const coverIdx = tempFilenames.indexOf(coverImageFilename);
					if (coverIdx > -1) {
						orderedFilenames.push(tempFilenames.splice(coverIdx, 1)[0]);
					}
				}
				
				// Add remaining files, perhaps sorted alphabetically for consistency
				tempFilenames.sort(); // Sort remaining files
				orderedFilenames.push(...tempFilenames);
				
				console.log(`[Memories Loader - ${slug}] Final ordered filenames for processing:`, JSON.stringify(orderedFilenames));
				
				if (orderedFilenames.length === 0) {
					console.warn(`[Memories Loader - ${slug}] No image filenames could be determined.`);
				}
				// --- End of new robust image filename collection and ordering logic ---

				// Resolve enhanced modules for the ordered filenames
				const resolvedPreviews = orderedFilenames.map(filename => {
					if (!filename || typeof filename !== 'string') {
                        console.warn(`[Memories Loader - ${slug}] Invalid or empty filename encountered in orderedFilenames:`, filename);
                        return null;
                    }
					const imageGlobPath = `/src/lib/assets/Memories/${slug}/${filename}`;
					const module = allImageModules[imageGlobPath] as EnhancedImageModule | undefined;

					if (module && module.default) {
						const alt = altTextMap.get(filename) || generateAltText(filename);
						return { src: module.default, alt, filename };
					} else {
						console.warn(`[Memories Loader - ${slug}] Enhanced image module not found for preview: '${filename}' (resolved path: '${imageGlobPath}'). This image will be skipped for previews.`);
						return null;
					}
				});

				const finalPreviews = resolvedPreviews
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

		console.log('[Memories Loader] Successfully loaded and grouped memoirs for landing page.');
		console.log('[Memories Loader] Final sortedKeys:', JSON.stringify(sortedKeys, null, 2));
		// console.log('[Memories Loader] Final groupedMemoirs:', JSON.stringify(groupedMemoirs, null, 2)); // This can be very verbose
		return {
			groupedMemoirs: groupedMemoirs,
			sortedKeys: sortedKeys
		};
	} catch (err) {
		console.error('[Memories Loader] Error loading memoirs:', err);
		error(500, 'Could not load memoirs');
	}
};