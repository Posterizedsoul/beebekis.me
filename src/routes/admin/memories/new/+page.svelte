<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, addDoc, Timestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import ImageUploader from '$lib/components/admin/ImageUploader.svelte';
	import SortableImageGrid from '$lib/components/admin/SortableImageGrid.svelte';

	interface ImageItem {
		url: string;
		altText: string;
	}

	let title = $state('');
	let slug = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);
	let description = $state('');
	let coverImage = $state('');
	let heroImage = $state('');
	let images: ImageItem[] = $state([]);
	let isPublished = $state(true);

	let saving = $state(false);
	let error = $state('');

	function handleUploadComplete(urls: string[]) {
		const newItems = urls.map((url) => ({
			url: url,
			altText: ''
		}));
		images = [...images, ...newItems];

		if (!coverImage && newItems.length > 0) {
			coverImage = newItems[0].url;
		}
		if (!heroImage && newItems.length > 0) {
			heroImage = newItems[0].url;
		}
	}

	$effect(() => {
		if (!slug && title) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;
		error = '';

		try {
			const docData = {
				title,
				slug,
				date: Timestamp.fromDate(new Date(date)),
				description,
				coverImage,
				heroImage,
				images: images.map((img, index) => ({
					...img,
					sortOrder: index
				})),
				isPublished,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now()
			};

			await addDoc(collection(db, 'memories'), docData);
			goto('/admin/memories');
		} catch (err: any) {
			console.error('Error saving memory:', err);
			error = 'Failed to save: ' + err.message;
		} finally {
			saving = false;
		}
	}
</script>

<!-- 2 Column Layout -->
<div class="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
	<!-- Main Content Area (Photos) -->
	<div class="flex-1 overflow-y-auto p-8">
		<div class="mx-auto max-w-4xl">
			<div class="mb-6">
				<input
					type="text"
					name="title"
					bind:value={title}
					placeholder="Album Title"
					class="w-full border-0 bg-transparent text-4xl font-bold text-gray-900 placeholder:text-gray-400 focus:ring-0"
				/>
				<p class="mt-1 text-sm text-gray-500">/memories/{slug || '...'}</p>
			</div>

			<!-- Photos Section -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-medium text-gray-900">Photos</h3>
					<span class="text-sm text-gray-500">{images.length} photos</span>
				</div>

				<!-- Upload Area -->
				<div class="mb-6">
					<ImageUploader
						multiple={true}
						folder={`memories/${slug || 'temp'}`}
						onUploadComplete={handleUploadComplete}
					/>
				</div>

				<!-- Image Grid -->
				{#if images.length > 0}
					<SortableImageGrid bind:images />
				{:else}
					<div
						class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1"
							class="text-gray-400"
						>
							<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
							<circle cx="9" cy="9" r="2" />
							<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
						</svg>
						<p class="mt-4 text-sm text-gray-500">No photos yet. Upload some to get started.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Right Sidebar -->
	<div class="w-80 overflow-y-auto border-l border-gray-200 bg-white p-6">
		<h3 class="mb-6 text-sm font-semibold text-gray-900">Album Settings</h3>

		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Save Button -->
			<button
				type="submit"
				disabled={saving}
				class="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
			>
				{saving ? 'Saving...' : 'Create Album'}
			</button>

			<hr class="border-gray-100" />

			<!-- Metadata -->
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
				</div>

				<div>
					<label for="description" class="block text-xs font-medium text-gray-500"
						>Description</label
					>
					<textarea
						id="description"
						rows="3"
						bind:value={description}
						placeholder="Brief summary for cards..."
						class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					></textarea>
				</div>

				<div class="flex items-center justify-between">
					<label for="isPublished" class="text-xs font-medium text-gray-500">Published</label>
					<input
						type="checkbox"
						id="isPublished"
						bind:checked={isPublished}
						class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
					/>
				</div>
			</div>

			<hr class="border-gray-100" />

			<!-- Cover Image -->
			<div>
				<label for="coverImage" class="mb-2 block text-xs font-medium text-gray-500"
					>Cover Image</label
				>
				{#if images.length > 0}
					<select
						id="coverImage"
						bind:value={coverImage}
						class="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					>
						{#each images as img, i}
							<option value={img.url}>Image {i + 1}</option>
						{/each}
					</select>
					{#if coverImage}
						<img
							src={coverImage}
							alt="Cover preview"
							class="mt-2 h-24 w-full rounded border object-cover"
						/>
					{/if}
				{:else}
					<p class="text-xs text-gray-400">Upload photos first</p>
				{/if}
			</div>

			<!-- Hero Image -->
			<div>
				<label for="heroImage" class="mb-2 block text-xs font-medium text-gray-500"
					>Hero Image</label
				>
				{#if images.length > 0}
					<select
						id="heroImage"
						bind:value={heroImage}
						class="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					>
						{#each images as img, i}
							<option value={img.url}>Image {i + 1}</option>
						{/each}
					</select>
					{#if heroImage}
						<img
							src={heroImage}
							alt="Hero preview"
							class="mt-2 h-24 w-full rounded border object-cover"
						/>
					{/if}
				{:else}
					<p class="text-xs text-gray-400">Upload photos first</p>
				{/if}
			</div>

			{#if error}
				<div class="rounded-md bg-red-50 p-2 text-xs text-red-600">
					{error}
				</div>
			{/if}
		</form>
	</div>
</div>
