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
		const postModule = await import(postModulePath);

		// Extract metadata if the module and metadata exist
		if (postModule && typeof postModule === 'object' && 'metadata' in postModule) {
			metadata = postModule.metadata as typeof metadata;

			 // Resolve featured image URL if present in metadata
			if (metadata.featuredImage && typeof metadata.featuredImage === 'string') {
				// If it starts with '/', assume it's root-relative (handled by static adapter or base path)
				if (metadata.featuredImage.startsWith('/')) {
					resolvedImageUrl = metadata.featuredImage;
				} else {
					// Otherwise, assume it's relative to the post's directory
					try {
						// Construct the Vite import path for the image relative to the post dir
						const imageImportPath = `${postDirPath}/${metadata.featuredImage}`;
						const imageModule = await import(imageImportPath);
						resolvedImageUrl = imageModule.default;
					} catch (imgErr) {
						console.warn(
							`Could not resolve featured image "${metadata.featuredImage}" relative to post "${slug}":`,
							imgErr
						);
					}
				}
			}
		} else {
			console.warn(`Metadata not found in module: ${postModulePath}`);
		}
	} catch (err) {
		console.error(`Error loading post module ${postModulePath}:`, err);
		// Consider throwing an error or returning specific error state
		// For now, it will proceed with default metadata
	}

	return {
		metadata,
		resolvedImageUrl
	};
};
