import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import yaml from 'js-yaml';
import path from 'path';

// Define types for clarity
interface ImageMetadata {
	filename: string;
	alt: string;
}

interface MemoryMetadata {
	title: string;
	date: string;
	description?: string;
	coverImage?: string; // Optional: specific image for card preview
	heroImage?: string; // Optional: specific image for page hero
	images: ImageMetadata[];
}

// Type for the enhanced image module structure (adjust based on actual output)
interface EnhancedImageModule {
	default: {
		src: string;
		srcset: string;
		width: number;
		height: number;
		// Potentially other properties like sources, placeholder etc.
	};
}

// Type for the image info passed to the page
interface EnhancedImageInfo {
	src: EnhancedImageModule['default']; // Pass the whole object
	alt: string;
	filename: string; // Keep filename for matching
}

export async function load({ params }) {
	const { slug } = params;
	console.log(`[${slug}] Loading memory data...`);

	try {
		// 1. Import all potential info.md, content.md, and image files using enhanced query
		const allInfoFiles = import.meta.glob('/src/lib/assets/Memories/**/info.md', {
			query: '?raw', // Use query string
			import: 'default', // Specify default import for raw content
			eager: true
		});
		const allContentFiles = import.meta.glob('/src/lib/assets/Memories/**/content.md', {
			query: '?raw', // Use query string
			import: 'default', // Specify default import for raw content
			eager: true
		});
		// Use enhanced query for images
		const allImageModules = import.meta.glob(
			'/src/lib/assets/Memories/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
			{ eager: true, query: { enhanced: true } } // Use enhanced query
		);

		// 2. Find the correct info.md file for the slug
		const infoGlobPath = `/src/lib/assets/Memories/${slug}/info.md`;
		const infoContent = allInfoFiles[infoGlobPath];

		if (!infoContent) {
			console.error(`[${slug}] info.md not found at path: ${infoGlobPath}`);
			error(404, `Memory not found: ${slug}`);
		}

		// 3. Parse metadata from info.md
		let metadata: MemoryMetadata;
		try {
			 // Use loadAll to handle potential multiple documents, take the first one
			const documents = yaml.loadAll(infoContent);
			if (!documents || documents.length === 0) {
				throw new Error('No YAML documents found in info.md');
			}
			const frontmatter = documents[0]; // Use the first document

			if (typeof frontmatter !== 'object' || frontmatter === null) {
				throw new Error('Invalid YAML format in the first document');
			}
			metadata = frontmatter as MemoryMetadata; // Add type assertion
			if (!metadata.images || !Array.isArray(metadata.images)) {
				metadata.images = []; // Ensure images is an array
				console.warn(`[${slug}] No 'images' array found in info.md, defaulting to empty.`);
			}
		} catch (e: any) {
			console.error(`[${slug}] Error parsing info.md YAML:`, e.message);
			error(500, `Error parsing memory metadata for ${slug}`);
		}

		// 4. Find the content.md file (optional)
		const contentGlobPath = `/src/lib/assets/Memories/${slug}/content.md`;

		// 5. Resolve image paths and gather alt text using enhanced modules
		const resolvedImages: (EnhancedImageInfo | null)[] = metadata.images.map((imgMeta) => {
			const imageGlobPath = `/src/lib/assets/Memories/${slug}/${imgMeta.filename}`;
			const module = allImageModules[imageGlobPath] as EnhancedImageModule | undefined;

			if (module && module.default) {
				console.log(`[${slug}] Resolved enhanced image: ${imgMeta.filename}`);
				return {
					src: module.default, // Pass the enhanced object
					alt: imgMeta.alt || '',
					filename: imgMeta.filename
				};
			} else {
				console.warn(
					`[${slug}] Image module not found or invalid for "${imgMeta.filename}" at path: ${imageGlobPath}`
				);
				// console.log('Available image module keys:', Object.keys(allImageModules));
				return null;
			}
		});

		const allImages = resolvedImages.filter((img): img is EnhancedImageInfo => img !== null);
		console.log(`[${slug}] All resolved enhanced images (for lightbox):`, allImages.map(i => i.filename));

		// 6. Separate Hero and Gallery images
		let heroImage: EnhancedImageInfo | null = null;
		let galleryImages: EnhancedImageInfo[] = [];

		if (allImages.length > 0) {
			// Prioritize heroImage field in metadata
			if (metadata.heroImage) {
				heroImage = allImages.find(img => img.filename === metadata.heroImage) || null;
				if (heroImage) {
					console.log(`[${slug}] Found specified hero image: ${metadata.heroImage}`);
				} else {
					console.warn(`[${slug}] Specified hero image "${metadata.heroImage}" not found. Falling back.`);
				}
			}

			// Fallback to coverImage if heroImage not found or specified
			if (!heroImage && metadata.coverImage) {
				heroImage = allImages.find(img => img.filename === metadata.coverImage) || null;
				if (heroImage) {
					console.log(`[${slug}] Using cover image as hero fallback: ${heroImage.filename}`);
				} else {
					console.warn(`[${slug}] Specified cover image "${metadata.coverImage}" not found. Falling back.`);
				}
			}

			// Fallback to the first image if still no hero
			if (!heroImage) {
				heroImage = allImages[0];
				console.log(`[${slug}] Using first available image as hero fallback: ${heroImage.filename}`);
			}

			// Gallery images are all images *except* the chosen hero
			galleryImages = allImages.filter(img => img.filename !== heroImage?.filename);
		}

		console.log(`[${slug}] Final Hero image:`, heroImage?.filename);
		console.log(`[${slug}] Final Gallery images:`, galleryImages.map(i => i.filename));

		// --- Content Processing ---
		let contentHtml = '';
		const contentMd = allContentFiles[contentGlobPath]; // Get content from glob (already raw string)

		if (contentMd) {
			try {
				// Ensure Marked processes paragraphs correctly etc.
				contentHtml = marked.parse(contentMd, { breaks: true, gfm: true });
			} catch (e) {
				console.warn(`[${slug}] Error parsing content.md:`, e);
			}
		}

		// Return all data needed by the page
		return {
			title: metadata.title,
			date: metadata.date,
			description: metadata.description || '',
			heroImage: heroImage, // Pass EnhancedImageInfo or null
			galleryImages: galleryImages, // Pass array of EnhancedImageInfo
			allImages: allImages, // Pass array of EnhancedImageInfo for lightbox
			contentHtml: contentHtml
		};
	} catch (e: any) {
		console.error(`[${slug}] Unexpected error loading memory:`, e);
		// Use SvelteKit's error helper for proper error handling
		error(500, `Failed to load memory ${slug}: ${e.message}`);
	}
}