import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
	// Get slug from params
	const slug = params.slug;

	// Construct paths based on the new location in src/lib/posts
	const postModulePath = `/src/lib/posts/${slug}/+page.md`;
	const postDirPath = `/src/lib/posts/${slug}`; // Directory path for assets

	let metadata: {
		title: string;
		date: string;
		excerpt?: string;
		featuredImage?: string;
		[key: string]: any;
	} = { title: 'Untitled Post', date: '', excerpt: '', featuredImage: '' };

	let resolvedImageUrl: string | null = null;

	try {
		// Dynamically import the specific post's module
		const postModule = await import(/* @vite-ignore */ postModulePath);

		// Extract metadata if the module and metadata exist
		if (postModule && typeof postModule === 'object' && 'metadata' in postModule) {
			metadata = postModule.metadata as typeof metadata;

			// If featuredImage exists in metadata, try to import it
			if (metadata.featuredImage) {
				try {
					// Image path is relative to the post's directory in src/lib/posts
					const imageImportPath = `${postDirPath}/${metadata.featuredImage}`;
					const imageModule = await import(/* @vite-ignore */ imageImportPath);
					resolvedImageUrl = imageModule.default; // Vite provides the resolved URL as the default export
				} catch (imgErr) {
					console.error(`Could not load featured image at ${postDirPath}/${metadata.featuredImage}:`, imgErr);
					// Keep metadata.featuredImage as the original filename for potential alt text, but URL is null
					metadata.featuredImage = undefined; // Clear the filename if load failed
				}
			}
		}
	} catch (e) {
		console.error(`Could not load post module at ${postModulePath}:`, e);
		// Fallback or error handling if needed
	}

	return {
		metadata: metadata,
		resolvedImageUrl: resolvedImageUrl // Pass the resolved URL separately
	};
};
