<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, addDoc, Timestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';
	import ImageUploader from '$lib/components/admin/ImageUploader.svelte';

	let title = $state('');
	let slug = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);
	let description = $state('');
	let content = $state('');
	let featuredImage = $state('');
	let tagsStr = $state('');
	let publishStatus: 'draft' | 'published' | 'scheduled' = $state('draft');
	let scheduledDateTime = $state('');

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
				publishStatus,
				isPublished: publishStatus === 'published',
				scheduledPublishDate:
					publishStatus === 'scheduled' && scheduledDateTime
						? Timestamp.fromDate(new Date(scheduledDateTime))
						: null,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now()
			};

			await addDoc(collection(db, 'blog_posts'), docData);
			goto('/admin/blog');
		} catch (err: any) {
			console.error('Error saving post:', err);
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
					placeholder="Post Title"
					class="w-full border-0 bg-transparent text-4xl font-bold text-gray-900 placeholder:text-gray-400 focus:ring-0"
				/>
			</div>

			<MarkdownEditor bind:value={content} placeholder="Start writing your article..." />
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
				{saving ? 'Saving...' : 'Publish Post'}
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
					<option value="scheduled">Scheduled</option>
				</select>
			</div>

			{#if publishStatus === 'scheduled'}
				<div>
					<label for="scheduledDate" class="block text-xs font-medium text-gray-500"
						>Publish Date & Time</label
					>
					<input
						type="datetime-local"
						id="scheduledDate"
						bind:value={scheduledDateTime}
						class="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black"
					/>
				</div>
			{/if}

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
