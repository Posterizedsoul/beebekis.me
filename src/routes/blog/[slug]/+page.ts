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

		// Resolve the featured image URL (logic copied from old +layout.ts)
		let resolvedImageUrl: string | null = null;
		if (metadata.featuredImage && typeof metadata.featuredImage === 'string' && metadata.featuredImage.startsWith('/')) {
			// Assume root-relative path in /static is the final URL
			resolvedImageUrl = metadata.featuredImage;
		} else if (metadata.featuredImage) {
			// Warn if the path doesn't look like a static asset path
			console.warn(`Featured image path "${metadata.featuredImage}" for post "${slug}" does not start with '/'. It might not resolve correctly if placed in 'static'.`);
            // You might add more complex resolution logic here if images are co-located
		}

		// Return all necessary data for the page component
		return {
			content,
			metadata,
			resolvedImageUrl
		};
	} catch (e) {
		console.error(`Error loading post ${slug}:`, e);
		// Throw a 404 if the import fails (likely post doesn't exist)
		error(404, `Post not found: ${slug}`);
	}
};
