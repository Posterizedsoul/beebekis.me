import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
interface PostMetadata {
	title: string;
	date: string;
	edited?: string | string[]; 
	excerpt?: string;
	featuredImage?: string;
	[key: string]: any;
}

// Import all potential featured images using glob
// Ensure this matches the structure, e.g., images are often in an 'img' subdirectory
const allImageModules = import.meta.glob('/src/lib/posts/**/img/*.+(avif|gif|heif|jpeg|jpg|png|tiff|webp)', { eager: true });

export const load: PageLoad = async ({ params }) => {
	const { slug } = params;

	try {
		// Dynamically import the Svelte component for the post
		// Adjust the path as necessary based on your project structure
		// Using .md here assuming your posts are Markdown files processed by mdsvex or similar
		const postModule = await import(`../../../lib/posts/${slug}/+page.md`);

		// Extract metadata and content
		const metadata = postModule.metadata ?? {
			title: 'Untitled Post',
			date: '',
			excerpt: '',
			featuredImage: ''
		} as PostMetadata;
		const content = postModule.default; // The Svelte component compiled from Markdown

		if (!metadata || !content) {
			console.error(`[${slug}] Post module loaded but missing metadata or default export.`);
			error(404, `Post not found or invalid: ${slug}`);
		}

		// Resolve the featured image URL using glob results
		let resolvedImageUrl: string | null = null;
		if (metadata.featuredImage && typeof metadata.featuredImage === 'string') {
			// If it starts with '/', assume it's root-relative (handled by static adapter or base path)
			if (metadata.featuredImage.startsWith('/')) {
				resolvedImageUrl = metadata.featuredImage;
				console.log(`[${slug}] Using root-relative featured image: ${resolvedImageUrl}`);
			} else {
				// Otherwise, assume it's relative to the post's directory and look in glob results
				// Construct the Vite glob key for the image relative to the project root
				const imageGlobKey = `/src/lib/posts/${slug}/${metadata.featuredImage}`; // e.g., /src/lib/posts/my-post/img/hero.jpg

				const imageModule = allImageModules[imageGlobKey] as { default: string } | undefined;

				if (imageModule && imageModule.default) {
					resolvedImageUrl = imageModule.default; // The default export is the resolved URL string
					console.log(`[${slug}] Resolved featured image "${metadata.featuredImage}" via glob to: ${resolvedImageUrl}`);
				} else {
					console.warn(
						`[${slug}] Could not resolve featured image "${metadata.featuredImage}" via glob key "${imageGlobKey}". Is the path correct in frontmatter and the image included?`
					);
					// console.log(`Available keys near /src/lib/posts/${slug}/:`, Object.keys(allImageModules).filter(k => k.startsWith(`/src/lib/posts/${slug}/`)));
				}
			}
		} else if (metadata.featuredImage) {
			console.warn(`[${slug}] featuredImage metadata is not a string:`, metadata.featuredImage);
		}

		// Return all necessary data for the page component
		return {
			content,
			metadata,
			resolvedImageUrl // This will be null if resolution failed or no image was specified
		};
	} catch (e: any) {
		console.error(`Error loading post ${slug}:`, e);
		// Throw a 404 if the import fails (likely post doesn't exist or path is wrong)
		// Check if the error indicates a module not found specifically for the .md file
		if (e.message?.includes('Unknown variable') || e.code === 'ERR_MODULE_NOT_FOUND') {
			error(404, `Post not found: ${slug}`);
		}
		error(500, `Failed to load post: ${slug}`);
	}
};
