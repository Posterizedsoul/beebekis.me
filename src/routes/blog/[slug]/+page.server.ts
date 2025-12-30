import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;

    try {
        console.log(`[Blog Post Loader] Loading post: ${slug}`);

        const q = query(
            collection(db, 'blog_posts'),
            where('slug', '==', slug),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error(`[Blog Post Loader] No post found for slug: ${slug}`);
            throw error(404, `Post not found: ${slug}`);
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        // Check if content exists
        let contentHtml = '';
        if (data.content) {
            try {
                contentHtml = await marked.parse(data.content, { breaks: true, gfm: true });
            } catch (e) {
                console.error(`[Blog Post Loader] Error parsing markdown for ${slug}:`, e);
            }
        } else {
            console.warn(`[Blog Post Loader] Post found but no content field in DB for: ${slug}`);
        }

        return {
            id: doc.id, // Add document ID for edit button
            metadata: {
                title: data.title,
                date: data.date?.toDate ? data.date.toDate().toISOString() : new Date(data.date).toISOString(),
                description: data.description,
                featuredImage: data.featuredImage, // Direct URL from Firestore
                edited: data.edited,
                excerpt: data.excerpt,
                tags: data.tags
            },
            contentHtml: contentHtml // Return the parsed HTML string directly
        };

    } catch (err: any) {
        console.error(`[Blog Post Loader] Error loading post ${slug}:`, err);
        if (err.status === 404) throw err;
        throw error(500, `Failed to load post: ${slug}`);
    }
};

// Disable ISR for this page so updated posts appear immediately
export const config = {
    isr: false
};
