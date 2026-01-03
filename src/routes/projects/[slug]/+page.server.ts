import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;

    try {
        console.log(`[Project Loader] Loading project: ${slug}`);

        const q = query(
            collection(db, 'projects'),
            where('slug', '==', slug),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error(`[Project Loader] No project found for slug: ${slug}`);
            throw error(404, `Project not found: ${slug}`);
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        // Parse markdown content
        let contentHtml = '';
        if (data.content) {
            try {
                contentHtml = await marked.parse(data.content, { breaks: true, gfm: true });
            } catch (e) {
                console.error(`[Project Loader] Error parsing markdown for ${slug}:`, e);
            }
        }

        // Get all images
        let images: { url: string; alt?: string }[] = [];
        if (data.images && Array.isArray(data.images)) {
            images = data.images.map((img: any) => ({
                url: img.url,
                alt: img.altText || 'Project image'
            }));
        }

        return {
            id: doc.id,
            metadata: {
                title: data.title,
                date: data.date?.toDate ? data.date.toDate().toISOString() : new Date(data.date).toISOString(),
                description: data.description,
                featuredImage: data.featuredImage,
                technologies: data.technologies || [],
                github: data.github,
                live: data.live
            },
            contentHtml,
            images
        };

    } catch (err: any) {
        console.error(`[Project Loader] Error loading project ${slug}:`, err);
        if (err.status === 404) throw err;
        throw error(500, `Failed to load project: ${slug}`);
    }
};

export const config = {
    isr: false
};
