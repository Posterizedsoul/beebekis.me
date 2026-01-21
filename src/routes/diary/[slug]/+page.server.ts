import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { marked } from 'marked';

// In-memory cache for diary entries (slug -> { data, timestamp })
const entryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedEntry(slug: string) {
    const cached = entryCache.get(slug);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedEntry(slug: string, data: any) {
    entryCache.set(slug, { data, timestamp: Date.now() });
}

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;

    // Check cache first
    const cached = getCachedEntry(slug);
    if (cached) {
        console.log(`[Diary Entry Loader] Cache hit for: ${slug}`);
        return cached;
    }

    try {
        console.log(`[Diary Entry Loader] Loading entry from Firebase: ${slug}`);

        const q = query(
            collection(db, 'diary_entries'),
            where('slug', '==', slug),
            where('isPublished', '==', true),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error(`[Diary Entry Loader] No entry found for slug: ${slug}`);
            throw error(404, `Entry not found: ${slug}`);
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        // Check if content exists
        let contentHtml = '';
        if (data.content) {
            try {
                contentHtml = await marked.parse(data.content, { breaks: true, gfm: true });
            } catch (e) {
                console.error(`[Diary Entry Loader] Error parsing markdown for ${slug}:`, e);
            }
        } else {
            console.warn(`[Diary Entry Loader] Entry found but no content field in DB for: ${slug}`);
        }

        const result = {
            id: doc.id, // Add document ID for edit button
            metadata: {
                title: data.title,
                date: data.date?.toDate ? data.date.toDate().toISOString() : new Date(data.date).toISOString(),
                description: data.description,
                featuredImage: data.featuredImage, // Direct URL
                edited: data.edited
            },
            contentHtml: contentHtml
        };

        // Cache the result
        setCachedEntry(slug, result);

        return result;

    } catch (err: any) {
        console.error(`[Diary Entry Loader] Error loading entry ${slug}:`, err);
        if (err.status === 404) throw err;
        throw error(500, `Failed to load entry: ${slug}`);
    }
};
