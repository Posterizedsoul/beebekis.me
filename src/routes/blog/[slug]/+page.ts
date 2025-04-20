import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Define the expected shape of post metadata (can be imported if shared)
interface PostMetadata {
	title: string;
	date: string;
	edited?: string | string[]; // Allow single date, array of dates, or undefined
	excerpt?: string;
	featuredImage?: string;
	[key: string]: any;
}

export const load: PageLoad = async ({ params }) => {
	const { slug } = params;
	try {
		// Dynamically import the specific post's module from /src/lib/posts
		// Use /* @vite-ignore */ to allow constructing the path dynamically if needed,
		// though Vite often handles template literals well.
		const postModule = await import(`../../../lib/posts/${slug}/+page.md`);

		// Ensure the module and its default export (the component) exist
		if (!postModule || !postModule.default) {
			error(404, `Post not found: ${slug}`);
		}

		// Extract metadata, providing defaults
		const metadata = (postModule.metadata ?? {
			title: 'Untitled Post',
			date: '',
			excerpt: '',
			featuredImage: ''
		}) as PostMetadata;

		// Get the Svelte component from the module's default export
		const content = postModule.default;

		// Resolve the featured image URL (logic adapted from old +layout.ts)
		let resolvedImageUrl: string | null = null;
		if (metadata.featuredImage && typeof metadata.featuredImage === 'string') {
			// If it starts with '/', assume it's root-relative (handled by static adapter or base path)
			if (metadata.featuredImage.startsWith('/')) {
				resolvedImageUrl = metadata.featuredImage;
			} else {
				// Otherwise, assume it's relative to the post's directory and try to import
				try {
					// Construct the Vite import path for the image relative to the post dir
					// The path needs to be relative to *this* file (+page.ts)
					const imageImportPath = `../../../lib/posts/${slug}/${metadata.featuredImage}`;
					// Vite's dynamic import handles resolving the actual URL
					const imageModule = await import(/* @vite-ignore */ imageImportPath);
					resolvedImageUrl = imageModule.default; // The default export should be the resolved URL string
					console.log(`[${slug}] Resolved relative featured image "${metadata.featuredImage}" to: ${resolvedImageUrl}`);
				} catch (imgErr) {
					console.warn(
						`[${slug}] Could not resolve featured image "${metadata.featuredImage}" relative to post directory. Is the path correct and the image included in the build? Error:`,
						imgErr
					);
					// Keep resolvedImageUrl as null if resolution fails
				}
			}
		} else if (metadata.featuredImage) {
			// Log if featuredImage is present but not a string (unexpected format)
			console.warn(`[${slug}] featuredImage metadata is not a string:`, metadata.featuredImage);
		}

		// Return all necessary data for the page component
		return {
			content,
			metadata,
			resolvedImageUrl // This will be null if resolution failed or no image was specified
		};
	} catch (e) {
		console.error(`Error loading post ${slug}:`, e);
		// Throw a 404 if the import fails (likely post doesn't exist)
		error(404, `Post not found: ${slug}`);
	}
};
