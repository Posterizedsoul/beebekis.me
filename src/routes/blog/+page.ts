import type { PageLoad } from './$types';
import { db } from '$lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { withCache } from '$lib/client/requestCache';

interface PostMetadata {
	title: string;
	date: string; // ISO string
	description?: string;
	featuredImage?: string;
	tags?: string[];
	slug: string;
}

interface GroupedPosts {
	[year: number]: PostMetadata[];
}

export const load: PageLoad = async () => {
	try {
		return await withCache('blog:list', async () => {
			console.log('Loading blog posts from Firestore...');

			const q = query(
				collection(db, 'blog_posts'),
				where('isPublished', '==', true),
				orderBy('date', 'desc')
			);

			const querySnapshot = await getDocs(q);
			const allTags = new Set<string>();

			const posts: PostMetadata[] = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				const dateObj = data.date?.toDate ? data.date.toDate() : new Date(data.date);

				if (data.tags && Array.isArray(data.tags)) {
					data.tags.forEach((tag: string) => allTags.add(tag));
				}

				return {
					slug: data.slug,
					title: data.title,
					date: dateObj.toISOString().split('T')[0],
					description: data.description,
					featuredImage: data.featuredImage, // Use direct URL from Firestore
					tags: data.tags || []
				};
			});

			// Group posts by year
			const groupedPosts: GroupedPosts = posts.reduce((acc, post) => {
				const year = new Date(post.date).getFullYear();
				if (!acc[year]) {
					acc[year] = [];
				}
				acc[year].push(post);
				return acc;
			}, {} as GroupedPosts);

			const sortedYears = Object.keys(groupedPosts)
				.map(Number)
				.sort((a, b) => b - a);

			return {
				posts: posts, // Flat list
				allTags: Array.from(allTags).sort(),
				groupedPosts: groupedPosts,
				sortedYears: sortedYears
			};
		});
	} catch (err: any) {
		console.error('Failed to load blog posts:', err);
		if (err.code === 'permission-denied') {
			console.error('[Blog Loader] Permission denied. Check Firestore Security Rules.');
		} else if (err.code === 'unavailable') {
			console.error('[Blog Loader] Firestore unavailable. Check network/config.');
		} else if (err.code === 'failed-precondition') {
			console.error('[Blog Loader] Failed precondition (likely missing index):', err.message);
		}

		return {
			posts: [],
			allTags: [],
			groupedPosts: {},
			sortedYears: []
		};
	}
};

// Disable ISR for this page so new posts appear immediately
export const config = {
	isr: false
};
