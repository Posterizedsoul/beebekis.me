<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, addDoc, Timestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';
	import ImageUploader from '$lib/components/admin/ImageUploader.svelte';
	import { processContentImages } from '$lib/utils/contentProcessor';

	let title = $state('');
	let slug = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);
	let description = $state('');
	let content = $state('');
	let featuredImage = $state('');
	let technologiesStr = $state('');
	let github = $state('');
	let live = $state('');
	let publishStatus: 'draft' | 'published' = $state('draft');
	let images: { url: string; filename: string; altText?: string }[] = $state([]);

	let saving = $state(false);
	let error = $state('');

	// Auto-generate slug
	$effect(() => {
		if (!slug && title) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	});

	function handleFeaturedImageUpload(urls: string[]) {
		if (urls.length > 0) {
			featuredImage = urls[0];
		}
	}

	function handleGalleryImageUpload(urls: string[]) {
		urls.forEach((url) => {
			images = [...images, { url, filename: url.split('/').pop() || 'image' }];
		});
	}

	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;
		error = '';

		try {
			const technologies = technologiesStr
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean);

			// Process content to group consecutive images into galleries
			const processedContent = processContentImages(content);

			// Filter out the featured image from gallery images to prevent it appearing in lightbox
			const featuredBase = featuredImage ? featuredImage.split('?')[0] : '';
			const filteredImages = images.filter((img) => {
				const imgBase = img.url ? img.url.split('?')[0] : '';
				return imgBase !== featuredBase;
			});

			const docData = {
				title,
				slug,
				date: Timestamp.fromDate(new Date(date)),
				description,
				content: processedContent,
				featuredImage,
				technologies,
				github,
				live,
				images: filteredImages,
				publishStatus,
				isPublished: publishStatus === 'published',
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now()
			};

			await addDoc(collection(db, 'projects'), docData);
			goto('/admin/projects');
		} catch (err: any) {
			console.error('Error saving project:', err);
			error = 'Failed to save: ' + err.message;
		} finally {
			saving = false;
		}
	}
</script>

<!-- 2 Column Layout -->
<div class="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
	<!-- Main Content Area -->
	<div class="flex-1 overflow-y-auto p-8">
		<div class="mx-auto max-w-4xl">
			<div class="mb-4">
				<input
					type="text"
					name="title"
					bind:value={title}
					placeholder="Project Title"
					class="w-full border-0 bg-transparent text-4xl font-bold text-gray-900 placeholder:text-gray-400 focus:ring-0"
				/>
			</div>

			<MarkdownEditor bind:value={content} placeholder="Write about your project..." />

			<!-- Gallery Images Section -->
			<div class="mt-8">
				<h3 class="mb-4 text-lg font-semibold text-gray-900">Project Gallery</h3>
				{#if images.length > 0}
					<div class="mb-4 grid grid-cols-4 gap-2">
						{#each images as image, i}
							<div class="group relative aspect-square overflow-hidden rounded-lg">
								<img src={image.url} alt="" class="h-full w-full object-cover" />
								<button
									type="button"
									onclick={() => removeImage(i)}
									class="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
									aria-label="Remove image"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}
				<ImageUploader
					folder="projects/gallery"
					onUploadComplete={handleGalleryImageUpload}
					multiple={true}
				/>
			</div>
		</div>
	</div>

	<!-- Right Sidebar -->
	<div class="w-80 overflow-y-auto border-l border-gray-200 bg-white p-6">
		<h3 class="mb-6 text-sm font-semibold text-gray-900">Settings</h3>

		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Save Button -->
			<button
				type="submit"
				disabled={saving}
				class="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
			>
				{saving ? 'Saving...' : 'Save Project'}
			</button>

			<!-- Publish Status -->
			<div>
				<label for="publishStatus" class="block text-xs font-medium text-gray-500">Status</label>
				<select
					id="publishStatus"
					bind:value={publishStatus}
					class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
				>
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</div>

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
					<label for="technologies" class="block text-xs font-medium text-gray-500"
						>Technologies</label
					>
					<input
						type="text"
						id="technologies"
						bind:value={technologiesStr}
						placeholder="Python, FastAPI, PyTorch..."
						class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					/>
				</div>

				<div>
					<label for="github" class="block text-xs font-medium text-gray-500">GitHub URL</label>
					<input
						type="url"
						id="github"
						bind:value={github}
						placeholder="https://github.com/..."
						class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					/>
				</div>

				<div>
					<label for="live" class="block text-xs font-medium text-gray-500">Live Demo URL</label>
					<input
						type="url"
						id="live"
						bind:value={live}
						placeholder="https://..."
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
								aria-label="Remove image"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
								</svg>
							</button>
						</div>
					{/if}
					<ImageUploader folder="projects/featured" onUploadComplete={handleFeaturedImageUpload} />
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
