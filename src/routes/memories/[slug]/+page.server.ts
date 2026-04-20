import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { compile } from 'mdsvex';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	try {
		console.log(`[Memory Loader] Loading memory: ${slug}`);

		const q = query(
			collection(db, 'memories'),
			where('slug', '==', slug),
			where('isPublished', '==', true),
			limit(1)
		);

		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			console.error(`[Memory Loader] No memory found for slug: ${slug}`);
			throw error(404, `Memory not found: ${slug}`);
		}

		const doc = querySnapshot.docs[0];
		const data = doc.data();

		// Compile the markdown content to HTML/Svelte if it exists
		// Memories might not always have content text, just images
		let contentHtml = '';
		if (data.content) {
			const compiled = await compile(data.content);
			contentHtml = compiled?.code || '';
		}

		// Normalize images array
		// Expected shape by component: { url: string, altText?: string, filename: string }
		const images = (data.images || []).map((img: any) => ({
			url: img.url,
			altText: img.altText || img.alt || '',
			filename: img.filename || 'image'
		}));

		return {
			id: doc.id, // Add document ID for edit button
			title: data.title,
			date: data.date?.toDate
				? data.date.toDate().toISOString()
				: new Date(data.date).toISOString(),
			description: data.description,
			heroImage: data.heroImage || null, // URL string
			coverImage: data.coverImage || null, // URL string
			images: images, // Array of RemoteImageInfo
			contentHtml: contentHtml // Compiled HTML string
		};
	} catch (err: any) {
		console.error(`[Memory Loader] Error loading memory ${slug}:`, err);
		if (err.status === 404) throw err;
	}
};

// Disable ISR for this page so updated memories appear immediately
export const config = {
	isr: false
};
