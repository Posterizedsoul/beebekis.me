import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

// Define the expected shape of post metadata
interface PostMetadata {
	title: string;
	date: string;
	description?: string;
	featuredImage?: string; // Add featuredImage
	tags?: string[]; // Add optional tags array
	[key: string]: any; // Allow other properties
}

// Define the shape of the post object we'll return
interface Post extends PostMetadata {
	slug: string;
	resolvedImageUrl?: string | null; // Add resolvedImageUrl
}

// Define the shape of the grouped posts object
interface GroupedPosts {
	[year: number]: Post[];
}

// Pre-fetch all featured images in each post's img/ subfolder
const allImageModules = import.meta.glob(
	'/src/lib/posts/*/img/*.+(avif|gif|heif|jpeg|jpg|png|tiff|webp)',
	{ eager: true }
);

function resolveBlogImageUrl(slug: string, filename: string): string | null {
	// Construct the key assuming filename already includes 'img/' prefix
	// e.g., filename is 'img/ag.jpg', slug is 'paper'
	// key becomes '/src/lib/posts/paper/img/ag.jpg'
	const key = `/src/lib/posts/${slug}/${filename}`;
	const mod = allImageModules[key] as { default: string } | undefined;
	if (mod?.default) return mod.default;

	// --- Debugging ---
	console.warn(`[Blog Index] Could not resolve "${filename}" for post "${slug}" using key "${key}".`);
	// Log available keys only if resolution fails and maybe limit the output
	const availableKeys = Object.keys(allImageModules);
	console.log(`[Blog Index Debug] Available image keys (${availableKeys.length}):`, availableKeys.slice(0, 10)); // Log first 10 keys
	// --- End Debugging ---

	return null;
}

export const load: PageServerLoad = async () => {
	try {
		// Get all post markdown files from the new location
		const postFiles = import.meta.glob('/src/lib/posts/*/+page.md');

		const posts: Post[] = await Promise.all(
			Object.entries(postFiles).map(async ([path, resolver]) => {
				// Extract slug from the new path structure
				const slugMatch = path.match(/\/lib\/posts\/([^/]+)\/\+page\.md$/);
				if (!slugMatch) {
					console.warn(`Could not extract slug from path: ${path}`);
					return null; // Skip if slug extraction fails
				}
				const slug = slugMatch[1];

				// Resolve the module to get metadata
				const postModule = (await resolver()) as any; // Cast to any for simplicity
				const metadata = (postModule?.metadata ?? {}) as PostMetadata;

				let resolvedImageUrl: string | null = null;
				if (metadata.featuredImage) {
					if (metadata.featuredImage.startsWith('/')) {
						// The path itself is the URL we need for static assets
						resolvedImageUrl = metadata.featuredImage;
					} else {
						// Attempt to resolve via Vite glob
						const imgUrl = resolveBlogImageUrl(slug, metadata.featuredImage);
						if (imgUrl) {
							resolvedImageUrl = imgUrl;
						} else {
							// Log failure here as well
							console.error(`Featured image path "${metadata.featuredImage}" for post "${slug}" could not be resolved.`);
						}
					}
				}

				// Ensure date is valid before proceeding
				if (!metadata.date || isNaN(new Date(metadata.date).getTime())) {
					console.warn(`Invalid or missing date for post "${slug}": ${metadata.date}`);
					return null; // Skip posts with invalid dates
				}

				// Ensure tags is an array if it exists, otherwise default to empty array
				const tags = Array.isArray(metadata.tags) ? metadata.tags : [];

				return {
					slug,
					...metadata,
					tags, // Ensure tags is always an array
					resolvedImageUrl // Add the resolved URL (which is the path itself)
				};
			})
		);

		// Filter out nulls and sort all valid posts by date first
		const validPosts = posts
			.filter((post): post is Post => post !== null)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		// Extract all unique tags
		const allTags = [
			...new Set(validPosts.flatMap(post => post.tags || [])) // Use tags array safely
		].sort(); // Sort tags alphabetically

		 // --- Debugging Logs ---
		console.log(`[Blog Server Load] Found ${validPosts.length} valid posts.`);
		console.log(`[Blog Server Load] Extracted tags:`, allTags);
		if (validPosts.length > 0) {
			console.log(`[Blog Server Load] Example post tags:`, validPosts[0].tags);
		}
		// --- End Debugging Logs ---

		// Group posts by year (optional, keep for potential future use if needed)
		const groupedPosts: GroupedPosts = validPosts.reduce((acc, post) => {
			const year = new Date(post.date).getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		}, {} as GroupedPosts);

		// Get sorted years (descending)
		const sortedYears = Object.keys(groupedPosts)
			.map(Number)
			.sort((a, b) => b - a);

		// Return the flat list of posts and the unique tags for the component
		return {
			posts: validPosts, // Pass the flat, sorted list
			allTags: allTags, // Pass the unique tags
			// Keep grouped data if needed elsewhere, but not primary for the list
			groupedPosts: groupedPosts,
			sortedYears: sortedYears
		};
	} catch (err) {
		console.error('Error loading blog posts:', err);
		error(500, 'Could not load blog posts');
	}
};