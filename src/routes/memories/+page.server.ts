import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import pkg from 'yaml'; // Import default export
const { parse } = pkg; // Destructure parse

// Define the expected shape of memoir metadata from info.md
interface MemoirMetadata {
    title: string;
    date: string;
    description?: string;
    coverImage?: string; // Added coverImage here for landing page logic
    images?: { filename: string; alt?: string }[];
    [key: string]: any;
}

// Define the shape of a single gallery preview item
interface GalleryPreview {
    src: string;
    alt: string;
}

// Define the shape of the memoir object for the landing page
interface MemoirSummary {
    slug: string;
    title: string;
    date: string;
    description?: string;
    galleryPreviews?: GalleryPreview[]; // Changed from galleryPreviewUrls
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

// Helper to read and parse frontmatter from info.md
async function readMemoirInfo(dirPath: string): Promise<MemoirMetadata | null> {
    const infoPath = path.join(dirPath, 'info.md');
    try {
        const content = await fs.readFile(infoPath, 'utf-8');
        const frontmatterMatch = content.match(/---\s*([\s\S]*?)\s*---/);
        if (frontmatterMatch && frontmatterMatch[1]) {
            return parse(frontmatterMatch[1]) as MemoirMetadata;
        }
        return null;
    } catch (e) {
        console.warn(`Could not read or parse info.md in ${dirPath}:`, e);
        return null;
    }
}

// Helper to find image files in a directory (returns filenames only)
async function findImageFilenames(dirPath: string, limit: number = Infinity): Promise<string[]> {
    try {
        const files = await fs.readdir(dirPath);
        const imageFiles = files.filter((file) =>
            /\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)$/i.test(file)
        );
        return imageFiles.slice(0, limit); // Return only filenames up to the limit
    } catch (e) {
        console.warn(`Could not read directory or find images in ${dirPath}:`, e);
        return [];
    }
}

// Pre-fetch all image modules using import.meta.glob
// Use eager: true to load modules immediately, adjust if performance becomes an issue
const allImageModules = import.meta.glob('/src/lib/assets/Memories/**/*.+(avif|gif|heif|jpeg|jpg|png|tiff|webp)', { eager: true });

// Helper to resolve image URLs safely using the pre-fetched modules
async function resolveImageUrl(
    baseImportPath: string, // e.g., /src/lib/assets/Memories/slug
    filename: string | null // e.g., image.jpg
): Promise<string | null> {
    if (!filename) return null;

    const imageImportPath = `${baseImportPath}/${filename}`; // Construct the full path key

    // Find the module in the glob results
    const imageModule = allImageModules[imageImportPath] as { default: string } | undefined;

    if (imageModule && imageModule.default) {
        return imageModule.default; // Return the resolved URL
    } else {
        console.warn(`Could not find or load image module for "${imageImportPath}" via glob. Trying fallback dynamic import...`);
        // Optionally, try a direct import as a fallback
        try {
            // Allow Vite to handle this dynamic import if the glob fails
            const dynamicModule = await import(imageImportPath);
            return dynamicModule.default;
        } catch (fallbackErr) {
            console.warn(`Fallback dynamic import also failed for "${imageImportPath}":`, fallbackErr);
            return null;
        }
    }
}

// Helper function to generate alt text from filename (if needed as fallback)
function generateAltText(filename: string): string {
    let name = filename.substring(0, filename.lastIndexOf('.')) || filename;
    name = name.replace(/[_-]/g, ' ');
    name = name.replace(/\b\w/g, char => char.toUpperCase());
    return name.trim();
}

// This is the CORRECT load function for the landing page /memories
export const load: PageServerLoad = async () => {
    const memoirsBaseDir = 'src/lib/assets/Memories'; // Updated base directory
    const PREVIEW_IMAGE_LIMIT = 4; // Fetch up to 4 images for the preview grid
    let memoirSummaries: (MemoirSummary | null)[] = [];

    try {
        const entries = await fs.readdir(memoirsBaseDir, { withFileTypes: true });
        const memoirDirs = entries.filter((entry) => entry.isDirectory());

        memoirSummaries = await Promise.all(
            memoirDirs.map(async (dir) => {
                const slug = dir.name;

                if (typeof slug !== 'string' || slug === '') {
                    console.warn(`Skipping directory entry with invalid name:`, dir);
                    return null;
                }

                const fullDirPath = path.join(memoirsBaseDir, slug);
                const viteImportPathBase = `/src/lib/assets/Memories/${slug}`; // Updated Vite import base path

                const metadata = await readMemoirInfo(fullDirPath);

                if (!metadata || !metadata.title || !metadata.date || isNaN(new Date(metadata.date).getTime())) {
                    console.warn(
                        `Skipping directory ${slug} due to missing/invalid title or date in info.md`
                    );
                    return null;
                }

                // --- Image Processing for Previews (Revised) ---

                // 1. Find all potential preview filenames (up to limit)
                let potentialFilenames: string[] = [];
                if (metadata.images && metadata.images.length > 0) {
                    potentialFilenames = metadata.images.map(img => img.filename).slice(0, PREVIEW_IMAGE_LIMIT);
                } else {
                    potentialFilenames = await findImageFilenames(fullDirPath, PREVIEW_IMAGE_LIMIT);
                }

                // 2. Create alt text lookup map from metadata.images
                const altTextMap = new Map<string, string>();
                if (metadata.images && metadata.images.length > 0) {
                    metadata.images.forEach(img => {
                        if (img.filename && img.alt) {
                            altTextMap.set(img.filename, img.alt);
                        }
                    });
                }

                // 3. Resolve URLs and combine with alt text
                const galleryPreviewsPromises = potentialFilenames.map(async (filename) => {
                    const src = await resolveImageUrl(viteImportPathBase, filename);
                    if (src) {
                        const alt = altTextMap.get(filename) || generateAltText(filename); // Use specific alt or generate fallback
                        return { src, alt };
                    }
                    return null;
                });

                const resolvedPreviews = await Promise.all(galleryPreviewsPromises);
                const galleryPreviews = resolvedPreviews.filter((p): p is GalleryPreview => p !== null);

                // Ensure coverImage is first if specified and resolved
                let finalPreviews = galleryPreviews;
                if (metadata.coverImage) {
                    const coverIndex = finalPreviews.findIndex(p => p.src.endsWith(metadata.coverImage!));
                    if (coverIndex > 0) { // If cover exists and is not already first
                        const coverPreview = finalPreviews.splice(coverIndex, 1)[0];
                        finalPreviews.unshift(coverPreview); // Move to front
                    } else if (coverIndex === -1) {
                        // If coverImage was specified but not resolved/found among previews, try resolving it separately
                        const coverSrc = await resolveImageUrl(viteImportPathBase, metadata.coverImage);
                        if (coverSrc) {
                            const coverAlt = altTextMap.get(metadata.coverImage) || generateAltText(metadata.coverImage);
                            finalPreviews.unshift({ src: coverSrc, alt: coverAlt });
                        }
                    }
                }
                // Ensure we still respect the limit after potentially adding cover separately
                finalPreviews = finalPreviews.slice(0, PREVIEW_IMAGE_LIMIT);

                return {
                    slug,
                    title: metadata.title,
                    date: metadata.date,
                    description: metadata.description,
                    galleryPreviews: finalPreviews // Pass the array of objects
                };

            })
        );

        // Filter out nulls and sort all valid memoirs by date first (most recent first)
        const validMemoirs = memoirSummaries
            .filter((memoir): memoir is MemoirSummary => memoir !== null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Group memoirs by Year -> Month -> Day
        const groupedMemoirs: GroupedByYear = validMemoirs.reduce((acc, memoir) => {
            const date = new Date(memoir.date);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
            const day = date.getDate(); // 1-indexed

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

        // Generate sorted keys for iteration
        const sortedKeys: SortedKeys = { years: [], months: {}, days: {} };

        sortedKeys.years = Object.keys(groupedMemoirs).map(Number).sort((a, b) => b - a); // Descending years

        for (const year of sortedKeys.years) {
            sortedKeys.months[year] = Object.keys(groupedMemoirs[year]).map(Number).sort((a, b) => b - a); // Descending months (Dec first)
            sortedKeys.days[year] = {}; // Initialize the days object for the year
            for (const month of sortedKeys.months[year]) {
                sortedKeys.days[year][month] = Object.keys(groupedMemoirs[year][month]).map(Number).sort((a, b) => b - a); // Descending days
            }
        }

        console.log('Grouped Memoirs:', JSON.stringify(groupedMemoirs, null, 2));
        console.log('Sorted Keys:', JSON.stringify(sortedKeys, null, 2));

        return {
            groupedMemoirs: groupedMemoirs,
            sortedKeys: sortedKeys
        };
    } catch (err) {
        console.error('Error loading memoirs:', err);
        if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
            console.warn(`Memoirs posts directory not found at ${memoirsBaseDir}. Returning empty list.`);
            return { groupedMemoirs: {}, sortedKeys: { years: [], months: {}, days: {} } };
        }
        error(500, 'Could not load memoirs');
    }
};