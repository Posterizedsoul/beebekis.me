<script lang="ts">
	import { onMount } from 'svelte';
	import { db, storage } from '$lib/firebase';
	import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
	import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

	let logs: string[] = $state([]);
	let migrating = $state(false);
	let progress = $state(0);
	let totalItems = $state(0);
	let processedItems = $state(0);

	function addLog(msg: string) {
		logs = [...logs, `[${new Date().toLocaleTimeString()}] ${msg}`];
		// Auto-scroll logic could go here
	}

	async function uploadImage(url: string, folder: string, filename: string): Promise<string> {
		try {
			addLog(`  -> Fetching ${filename} from local dev server...`);
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Failed to fetch local image: ${response.statusText}`);

			const blob = await response.blob();
			addLog(`  -> Blob size: ${blob.size} bytes. Starting Firebase upload...`);

			const storageRef = ref(storage, `${folder}/${filename}`);

			await uploadBytes(storageRef, blob);
			const downloadUrl = await getDownloadURL(storageRef);
			addLog(`     Success: ${filename}`);
			return downloadUrl;
		} catch (e: any) {
			addLog(`  -> ERROR uploading ${filename}: ${e.message}`);
			// Return original URL or placeholder if upload fails, to let migration continue
			return '';
		}
	}

	async function migrate() {
		migrating = true;
		logs = [];
		processedItems = 0;
		addLog('Starting migration...');

		try {
			// 1. Fetch data
			addLog('Fetching local data...');
			const response = await fetch('/api/migration-data');
			const data = await response.json();

			const { memories, diaryEntries, blogPosts } = data;
			totalItems = memories.length + diaryEntries.length + blogPosts.length;
			addLog(
				`Found ${memories.length} memories, ${diaryEntries.length} diary entries, ${blogPosts.length} blog posts.`
			);

			// 2. Migrate Memories
			for (const m of memories) {
				addLog(`Migrating Memory: ${m.title}`);

				let coverImageUrl = '';
				let heroImageUrl = '';
				const uploadedImages = [];

				// Upload all images
				for (const img of m.localImages) {
					const firebaseIndUrl = await uploadImage(img.url, `memories/${m.slug}`, img.filename);
					uploadedImages.push({
						url: firebaseIndUrl,
						altText: '',
						filename: img.filename
					});

					// Check if this matched cover/hero
					// Metadata might have 'coverImage: something.jpg' or 'img/something.jpg'
					// We try to match filename
					if (m.coverImage && img.path.endsWith(m.coverImage)) coverImageUrl = firebaseIndUrl;
					if (m.heroImage && img.path.endsWith(m.heroImage)) heroImageUrl = firebaseIndUrl;
				}

				// Fallback for cover/hero if not matched (e.g. strict string match failed)
				// If they are just filenames in metadata
				if (!coverImageUrl && m.coverImage) {
					const match = uploadedImages.find((i) => m.coverImage.includes(i.filename));
					if (match) coverImageUrl = match.url;
				}
				if (!heroImageUrl && m.heroImage) {
					const match = uploadedImages.find((i) => m.heroImage.includes(i.filename));
					if (match) heroImageUrl = match.url;
				}

				addLog(`  -> Saving memory metadata to Firestore...`);
				await setDoc(doc(db, 'memories', m.slug), {
					title: m.title || 'Untitled',
					slug: m.slug,
					date: m.date ? Timestamp.fromDate(new Date(m.date)) : Timestamp.now(),
					description: m.description || '',
					coverImage: coverImageUrl,
					heroImage: heroImageUrl,
					images: uploadedImages,
					createdAt: Timestamp.now(),
					updatedAt: Timestamp.now()
				});
				addLog(`  -> Saved successfully.`);
				processedItems++;
			}

			// 3. Migrate Diary
			for (const d of diaryEntries) {
				addLog(`Migrating Diary: ${d.title}`);

				let featuredImageUrl = '';

				for (const img of d.localImages) {
					const url = await uploadImage(img.url, `diary/${d.slug}`, img.filename);

					if (d.featuredImage && img.path.endsWith(d.featuredImage)) {
						featuredImageUrl = url;
					} else if (d.featuredImage && d.featuredImage.includes(img.filename)) {
						featuredImageUrl = url;
					}
				}

				await setDoc(doc(db, 'diary_entries', d.slug), {
					title: d.title || 'Untitled',
					slug: d.slug,
					date: d.date ? Timestamp.fromDate(new Date(d.date)) : Timestamp.now(),
					description: d.description || '',
					excerpt: d.excerpt || '',
					content: d.content || '',
					featuredImage: featuredImageUrl,
					isPublished: true, // Auto-publish existing
					createdAt: Timestamp.now(),
					updatedAt: Timestamp.now()
				});
				processedItems++;
			}

			// 4. Migrate Blog
			for (const p of blogPosts) {
				addLog(`Migrating Blog: ${p.title}`);

				let featuredImageUrl = '';

				for (const img of p.localImages) {
					const url = await uploadImage(img.url, `blog/${p.slug}`, img.filename);

					if (p.featuredImage && img.path.endsWith(p.featuredImage)) {
						featuredImageUrl = url;
					} else if (p.featuredImage && p.featuredImage.includes(img.filename)) {
						featuredImageUrl = url;
					}
				}

				await setDoc(doc(db, 'blog_posts', p.slug), {
					title: p.title || 'Untitled',
					slug: p.slug,
					date: p.date ? Timestamp.fromDate(new Date(p.date)) : Timestamp.now(),
					description: p.description || '',
					content: p.content || '', // This is HTML from MD
					featuredImage: featuredImageUrl,
					tags: p.tags || [],
					isPublished: true,
					createdAt: Timestamp.now(),
					updatedAt: Timestamp.now()
				});
				processedItems++;
			}

			addLog('Migration Complete!');
		} catch (err: any) {
			addLog(`CRITICAL ERROR: ${err.message}`);
			console.error(err);
		} finally {
			migrating = false;
		}
	}
</script>

<div class="mx-auto max-w-4xl px-4 py-12">
	<h1 class="mb-6 text-3xl font-bold">Content Migration Tool</h1>

	<div class="mb-8 border-l-4 border-yellow-400 bg-yellow-50 p-4">
		<div class="flex">
			<div class="flex-shrink-0">
				<!-- Icon -->
			</div>
			<div class="ml-3">
				<p class="text-sm text-yellow-700">
					This tool will read all local files (Memories, Diary, Blog) and upload them to Firebase.
					<strong>This may take a while</strong> depending on the number of images. Keep this tab open.
				</p>
			</div>
		</div>
	</div>

	{#if !migrating && processedItems === 0}
		<button
			onclick={migrate}
			class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow hover:bg-blue-700"
		>
			Start Migration
		</button>
	{/if}

	{#if migrating}
		<div class="mt-4">
			<div class="mb-2 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
				<div
					class="h-2.5 rounded-full bg-blue-600"
					style="width: {(processedItems / totalItems) * 100}%"
				></div>
			</div>
			<p class="text-center text-sm text-gray-600">
				Processing {processedItems} of {totalItems} items
			</p>
		</div>
	{/if}

	<div class="mt-8 h-96 overflow-y-auto rounded-lg bg-black p-4 font-mono text-sm text-green-400">
		{#each logs as log}
			<div>{log}</div>
		{/each}
		{#if logs.length === 0}
			<span class="text-gray-500">Waiting to start...</span>
		{/if}
	</div>
</div>
