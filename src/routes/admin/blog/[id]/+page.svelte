<script lang="ts">
	import { db } from '$lib/firebase';
	import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';
	import ImageUploader from '$lib/components/admin/ImageUploader.svelte';
	import { onMount } from 'svelte';

	let { data } = $props(); // If we had server load, but we are doing client side

	// Get ID from URL params
	// Svelte 5 page state access: page.params.id
	const id = page.params.id;

	let title = $state('');
	let slug = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);
	let description = $state('');
	let content = $state('');
	let featuredImage = $state('');
	let tagsStr = $state('');
	let isPublished = $state(false);

	let loading = $state(true);
	let saving = $state(false);
	let deleting = $state(false);
	let error = $state('');

	onMount(async () => {
		if (!id) return;
		try {
			const docRef = doc(db, 'blog_posts', id);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				title = data.title || '';
				slug = data.slug || '';
				// Handle Timestamp or Date string or fallbacks
				if (data.date?.toDate) {
					date = data.date.toDate().toISOString().split('T')[0];
				} else if (typeof data.date === 'string') {
					date = data.date.split('T')[0];
				}

				description = data.description || '';
				content = data.content || '';
				featuredImage = data.featuredImage || '';
				tagsStr = (data.tags || []).join(', ');
				isPublished = data.isPublished || false;
			} else {
				error = 'Post not found';
			}
		} catch (err: any) {
			console.error('Error fetching post:', err);
			error = 'Failed to load post: ' + err.message;
		} finally {
			loading = false;
		}
	});

	// Auto-update slug if empty (only on first load if missing)
	// But usually editing shouldn't auto-change slug unless explicitly wanted.
	// So we won't auto-bind slug generation here to prevent breaking links.

	function handleImageUpload(urls: string[]) {
		if (urls.length > 0) {
			featuredImage = urls[0];
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;
		error = '';

		try {
			const tags = tagsStr
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean);

			const docData = {
				title,
				slug,
				date: Timestamp.fromDate(new Date(date)),
				description,
				content,
				featuredImage,
				tags,
				isPublished,
				updatedAt: Timestamp.now()
			};

			await updateDoc(doc(db, 'blog_posts', id), docData);
			goto('/admin/blog');
		} catch (err: any) {
			console.error('Error updating post:', err);
			error = 'Failed to save: ' + err.message;
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

		deleting = true;
		try {
			await deleteDoc(doc(db, 'blog_posts', id));
			goto('/admin/blog');
		} catch (err: any) {
			console.error('Error deleting post:', err);
			error = 'Failed to delete: ' + err.message;
			deleting = false;
		}
	}
</script>

<!-- Layout Change: 2 Column (Main Content + Sidebar) -->
<div class="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
	<!-- Main Content Area (Scrollable) -->
	<div class="flex-1 overflow-y-auto p-8">
		<div class="mx-auto max-w-4xl">
			<div class="mb-4">
				<input
					type="text"
					name="title"
					bind:value={title}
					placeholder="Post Title"
					class="w-full border-0 bg-transparent text-4xl font-bold text-gray-900 placeholder:text-gray-400 focus:ring-0"
				/>
			</div>

			<MarkdownEditor bind:value={content} placeholder="Start writing your article..." />
		</div>
	</div>

	<!-- Right Sidebar (Fixed) -->
	<div class="w-80 overflow-y-auto border-l border-gray-200 bg-white p-6">
		<div class="mb-6 flex items-center justify-between">
			<h3 class="text-sm font-semibold text-gray-900">Settings</h3>
			<div class="flex gap-2">
				<button onclick={handleDelete} class="text-red-600 hover:text-red-800" title="Delete">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-trash-2"
						><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
							d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
						/><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg
					>
				</button>
			</div>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Publish Action -->
			<button
				type="submit"
				disabled={saving}
				class="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
			>
				{saving ? 'Saving...' : 'Save Changes'}
			</button>

			{#if slug}
				<a
					href="/blog/{slug}"
					target="_blank"
					class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
				>
					View Public Page ↗
				</a>
			{/if}

			<!-- Status -->
			<div class="flex items-center">
				<input
					id="published"
					name="published"
					type="checkbox"
					bind:checked={isPublished}
					class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
				/>
				<label for="published" class="ml-2 block text-sm text-gray-900">Published on site</label>
			</div>

			<hr class="border-gray-100" />

			<!-- Metadata Inputs -->
			<div class="space-y-4">
				<div>
					<label for="date" class="block text-xs font-medium text-gray-500">Date</label>
					<input
						type="date"
						id="date"
						bind:value={date}
						class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					/>
				</div>

				<div>
					<label for="slug" class="block text-xs font-medium text-gray-500">Slug</label>
					<input
						type="text"
						id="slug"
						bind:value={slug}
						class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					/>
					<p class="mt-1 text-[10px] text-gray-400">Changing slug breaks existing links.</p>
				</div>

				<div>
					<label for="tags" class="block text-xs font-medium text-gray-500">Tags</label>
					<input
						type="text"
						id="tags"
						bind:value={tagsStr}
						placeholder="tech, design..."
						class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					/>
				</div>

				<div>
					<label for="description" class="block text-xs font-medium text-gray-500"
						>Description</label
					>
					<textarea
						id="description"
						rows="3"
						bind:value={description}
						class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					></textarea>
				</div>
			</div>

			<hr class="border-gray-100" />

			<!-- Featured Image -->
			<div>
				<label class="mb-2 block text-xs font-medium text-gray-500">Featured Image</label>
				<div class="space-y-2">
					{#if featuredImage}
						<div class="group relative">
							<img
								src={featuredImage}
								alt="Featured"
								class="h-32 w-full rounded border object-cover"
							/>
							<button
								type="button"
								onclick={() => (featuredImage = '')}
								class="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg
								>
							</button>
						</div>
					{/if}
					<ImageUploader folder="blog/featured" onUploadComplete={handleImageUpload} />
				</div>
			</div>

			{#if error}
				<div class="rounded-md bg-red-50 p-2 text-xs text-red-600">
					{error}
				</div>
			{/if}
		</form>
	</div>
</div>
