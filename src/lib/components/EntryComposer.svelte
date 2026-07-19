<script lang="ts">
	import { db } from '$lib/firebase';
	import {
		collection,
		addDoc,
		doc,
		getDoc,
		updateDoc,
		deleteDoc,
		Timestamp
	} from 'firebase/firestore';
	import { goto, invalidateAll } from '$app/navigation';
	import MarkdownEditor from '$lib/components/admin/MarkdownEditor.svelte';
	import ImageUploader from '$lib/components/admin/ImageUploader.svelte';
	import SortableImageGrid from '$lib/components/admin/SortableImageGrid.svelte';
	import { X, SlidersHorizontal, Trash2 } from 'lucide-svelte';
	import { portal } from '$lib/actions/portal';

	type Kind = 'diary' | 'blog' | 'project' | 'memory';

	let { kind, onClose, docId = '' }: { kind: Kind; onClose: () => void; docId?: string } = $props();

	const config: Record<
		Kind,
		{
			collection: string;
			path: string;
			label: string;
			titlePlaceholder: string;
			contentPlaceholder: string;
			featuredFolder: string;
			hasScheduled: boolean;
		}
	> = {
		diary: {
			collection: 'diary_entries',
			path: '/diary',
			label: 'Diary Entry',
			titlePlaceholder: 'Entry Title',
			contentPlaceholder: 'Write your thoughts...',
			featuredFolder: 'diary/featured',
			hasScheduled: true
		},
		blog: {
			collection: 'blog_posts',
			path: '/blog',
			label: 'Blog Post',
			titlePlaceholder: 'Post Title',
			contentPlaceholder: 'Start writing your article...',
			featuredFolder: 'blog/featured',
			hasScheduled: true
		},
		project: {
			collection: 'projects',
			path: '/projects',
			label: 'Project',
			titlePlaceholder: 'Project Title',
			contentPlaceholder: 'Write about your project...',
			featuredFolder: 'projects/featured',
			hasScheduled: false
		},
		memory: {
			collection: 'memories',
			path: '/memories',
			label: 'Memory',
			titlePlaceholder: 'Album Title',
			contentPlaceholder: '',
			featuredFolder: 'memories/featured',
			hasScheduled: false
		}
	};

	const cfg = config[kind];
	const isEdit = !!docId;

	// Maps EntryComposer kind to the cache key prefix used by requestCache.ts
	const cachePrefixes: Record<Kind, string> = {
		diary: 'diary',
		blog: 'blog',
		project: 'projects',
		memory: 'memories'
	};

	/** Bust the server-side in-memory cache so load functions fetch fresh data. */
	async function revalidateCache() {
		try {
			await fetch('/api/revalidate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prefix: cachePrefixes[kind] })
			});
		} catch (e) {
			console.warn('Cache revalidation failed (non-critical):', e);
		}
	}

	// Common fields
	let title = $state('');
	let slug = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);
	let description = $state('');
	let content = $state('');
	let featuredImage = $state('');
	let publishStatus: 'draft' | 'published' | 'scheduled' = $state('published');
	let scheduledDateTime = $state('');

	// Blog
	let tagsStr = $state('');

	// Project
	let technologiesStr = $state('');
	let github = $state('');
	let live = $state('');
	let galleryImages: { url: string; filename: string; thumbUrl?: string }[] = $state([]);

	// Memory
	let memoryImages: { url: string; altText: string }[] = $state([]);
	let coverImage = $state('');
	let heroImage = $state('');

	let loading = $state(isEdit);
	let saving = $state(false);
	let deleting = $state(false);
	let saved = $state(false);
	let error = $state('');
	let showDetails = $state(false);
	let slugEdited = $state(isEdit);

	function tsToDateStr(v: unknown): string {
		if (!v) return new Date().toISOString().split('T')[0];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const d = (v as any)?.toDate ? (v as any).toDate() : new Date(v as string);
		return d.toISOString().split('T')[0];
	}

	// Load existing document in edit mode
	$effect(() => {
		if (!isEdit) return;
		(async () => {
			try {
				const snap = await getDoc(doc(db, cfg.collection, docId));
				if (!snap.exists()) {
					error = 'Entry not found.';
					return;
				}
				const data = snap.data();
				title = data.title || '';
				slug = data.slug || '';
				date = tsToDateStr(data.date);
				description = data.description || '';
				content = data.content || '';
				featuredImage = data.featuredImage || '';
				publishStatus = data.publishStatus || (data.isPublished ? 'published' : 'draft');
				if (data.scheduledPublishDate?.toDate) {
					scheduledDateTime = data.scheduledPublishDate.toDate().toISOString().slice(0, 16);
				}
				tagsStr = (data.tags || []).join(', ');
				technologiesStr = (data.technologies || []).join(', ');
				github = data.github || '';
				live = data.live || '';
				if (kind === 'project') {
					galleryImages = data.images || [];
				}
				if (kind === 'memory') {
					memoryImages = [...(data.images || [])].sort(
						(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
					);
					coverImage = data.coverImage || '';
					heroImage = data.heroImage || '';
				}
			} catch (err: unknown) {
				console.error('Error loading entry:', err);
				error = 'Failed to load: ' + (err instanceof Error ? err.message : String(err));
			} finally {
				loading = false;
			}
		})();
	});

	// Auto-generate slug from title (until manually edited or in edit mode)
	$effect(() => {
		if (!slugEdited && title) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	});

	// Lock page scroll while the composer is open
	$effect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	function handleFeaturedUpload(urls: string[]) {
		if (urls.length > 0) featuredImage = urls[0];
	}

	function handleGalleryUpload(urls: string[], thumbUrls?: string[]) {
		urls.forEach((url, i) => {
			galleryImages = [
				...galleryImages,
				{ url, filename: url.split('/').pop() || 'image', thumbUrl: thumbUrls?.[i] }
			];
		});
	}

	function handleMemoryUpload(urls: string[]) {
		memoryImages = [...memoryImages, ...urls.map((url) => ({ url, altText: '' }))];
		if (!coverImage && urls.length > 0) coverImage = urls[0];
		if (!heroImage && urls.length > 0) heroImage = urls[0];
	}

	function hasContent(): boolean {
		const text = content.replace(/<[^>]*>/g, '').trim();
		return !!(title.trim() || text || memoryImages.length || galleryImages.length);
	}

	// Closing a new entry with content saves it as a draft instead of losing it;
	// drafts show up as pills next to the Add button.
	async function requestClose() {
		if (!isEdit && !saved && hasContent()) {
			publishStatus = 'draft';
			if (!title.trim()) title = 'Untitled draft';
			if (!slug.trim()) slug = 'draft-' + Date.now();
			await handleSubmit();
			return;
		}
		onClose();
	}

	async function handleDelete() {
		if (!confirm('Delete this entry permanently? This cannot be undone.')) return;
		deleting = true;
		error = '';
		try {
			await deleteDoc(doc(db, cfg.collection, docId));
			await revalidateCache();
			await invalidateAll();
			onClose();
		} catch (err: unknown) {
			console.error('Error deleting entry:', err);
			error = 'Failed to delete: ' + (err instanceof Error ? err.message : String(err));
			deleting = false;
		}
	}

	async function handleSubmit(e?: Event) {
		e?.preventDefault();
		if (!title.trim() || !slug.trim()) {
			error = 'A title is required.';
			return;
		}
		saving = true;
		error = '';

		try {
			const base = {
				title,
				slug,
				date: Timestamp.fromDate(new Date(date)),
				description,
				isPublished: publishStatus === 'published',
				updatedAt: Timestamp.now()
			};

			let docData: Record<string, unknown>;

			if (kind === 'memory') {
				docData = {
					...base,
					coverImage,
					heroImage,
					images: memoryImages.map((img, index) => ({ ...img, sortOrder: index }))
				};
			} else if (kind === 'project') {
				const featuredBase = featuredImage ? featuredImage.split('?')[0] : '';
				docData = {
					...base,
					content,
					featuredImage,
					technologies: technologiesStr
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean),
					github,
					live,
					images: galleryImages.filter(
						(img) => (img.url ? img.url.split('?')[0] : '') !== featuredBase
					),
					publishStatus
				};
			} else {
				docData = {
					...base,
					content,
					featuredImage,
					publishStatus,
					scheduledPublishDate:
						publishStatus === 'scheduled' && scheduledDateTime
							? Timestamp.fromDate(new Date(scheduledDateTime))
							: null,
					...(kind === 'blog'
						? {
								tags: tagsStr
									.split(',')
									.map((t) => t.trim())
									.filter(Boolean)
							}
						: {})
				};
			}

			if (isEdit) {
				await updateDoc(doc(db, cfg.collection, docId), docData);
			} else {
				await addDoc(collection(db, cfg.collection), { ...docData, createdAt: Timestamp.now() });
			}
			saved = true;

			// Bust the server-side cache before SvelteKit re-runs load functions
			await revalidateCache();

			await invalidateAll();
			setTimeout(onClose, 900);
		} catch (err: unknown) {
			console.error('Error saving entry:', err);
			error = 'Failed to save: ' + (err instanceof Error ? err.message : String(err));
		} finally {
			saving = false;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div use:portal class="overlay-backdrop fixed inset-0 z-[100]" onclick={requestClose}></div>

<div
	use:portal
	class="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-2 md:p-6"
>
	<div
		class="overlay-panel pointer-events-auto relative flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
	>
		<!-- Header -->
		<header
			class="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 sm:px-6"
		>
			<div class="flex min-w-0 items-center gap-3">
				<button
					type="button"
					onclick={requestClose}
					class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
					aria-label="Close"
				>
					<X size={20} />
				</button>
				<span
					class="truncate font-serif text-sm font-semibold tracking-widest text-gray-900 uppercase"
					>{isEdit ? 'Edit' : 'New'} {cfg.label}</span
				>
			</div>

			<div class="flex flex-shrink-0 items-center gap-2 sm:gap-3">
				{#if saved && publishStatus !== 'published'}
					<span class="text-sm text-gray-600">Saved ✓</span>
				{/if}
				{#if error}
					<span class="max-w-52 truncate text-sm text-red-600" title={error}>{error}</span>
				{/if}

				<button
					type="button"
					onclick={() => (showDetails = true)}
					class="flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-black hover:text-black"
					title="Date, slug, description, images…"
				>
					<SlidersHorizontal size={15} />
					<span class="hidden sm:inline">Details</span>
				</button>

				<select
					bind:value={publishStatus}
					class="rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
					aria-label="Publish status"
				>
					<option value="published">Publish</option>
					<option value="draft">Draft</option>
					{#if cfg.hasScheduled}
						<option value="scheduled">Scheduled</option>
					{/if}
				</select>
				{#if publishStatus === 'scheduled'}
					<input
						type="datetime-local"
						bind:value={scheduledDateTime}
						class="rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
					/>
				{/if}

				<button
					type="button"
					onclick={handleSubmit}
					disabled={saving || loading}
					class="rounded-sm border border-black bg-black px-5 py-2 font-serif text-sm font-medium tracking-wider text-white uppercase transition-colors hover:bg-gray-800 disabled:opacity-50"
				>
					{saving ? 'Saving...' : publishStatus === 'published' ? 'Publish' : 'Save'}
				</button>

				{#if isEdit}
					<button
						type="button"
						onclick={handleDelete}
						disabled={deleting}
						class="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
						aria-label="Delete entry"
						title="Delete entry"
					>
						<Trash2 size={18} />
					</button>
				{/if}
			</div>
		</header>

		<!-- Body -->
		<div class="flex-1 overflow-y-auto">
			{#if loading}
				<div class="flex h-full items-center justify-center text-gray-500">Loading…</div>
			{:else}
				<div class="mx-auto max-w-4xl px-6 py-10 sm:px-10 md:py-16">
					<input
						type="text"
						bind:value={title}
						placeholder={cfg.titlePlaceholder}
						class="mb-8 w-full border-0 bg-transparent p-0 font-serif text-4xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-0 md:text-5xl"
					/>

					{#if kind === 'memory'}
						<!-- Photo album flow -->
						<div class="space-y-8">
							<ImageUploader
								multiple={true}
								folder={`memories/${slug || 'temp'}`}
								onUploadComplete={handleMemoryUpload}
							/>
							{#if memoryImages.length > 0}
								<SortableImageGrid bind:images={memoryImages} />
							{/if}
						</div>
					{:else}
						<MarkdownEditor bind:value={content} placeholder={cfg.contentPlaceholder} />
					{/if}

					{#if kind === 'project'}
						<div class="mt-12 border-t border-gray-100 pt-8">
							<h3
								class="mb-4 font-serif text-sm font-semibold tracking-widest text-gray-900 uppercase"
							>
								Project Gallery
							</h3>
							{#if galleryImages.length > 0}
								<div class="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
									{#each galleryImages as image, i (image.url)}
										<div class="group relative aspect-square overflow-hidden rounded-lg">
											<img src={image.url} alt="" class="h-full w-full object-cover" />
											<button
												type="button"
												onclick={() => (galleryImages = galleryImages.filter((_, j) => j !== i))}
												class="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
												aria-label="Remove image"
											>
												<X size={12} />
											</button>
										</div>
									{/each}
								</div>
							{/if}
							<ImageUploader
								folder="projects/gallery"
								onUploadComplete={handleGalleryUpload}
								multiple={true}
							/>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Details drawer -->
{#if showDetails}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div
		use:portal
		class="drawer-backdrop fixed inset-0 z-[110]"
		onclick={() => (showDetails = false)}
	></div>
	<aside
		use:portal
		class="drawer-panel fixed top-0 right-0 bottom-0 z-[120] flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl"
	>
		<div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
			<h3 class="font-serif text-sm font-semibold tracking-widest text-gray-900 uppercase">
				Details
			</h3>
			<div class="flex items-center gap-3">
				{#if isEdit && slug}
					<a
						href="{cfg.path}/{slug}"
						target="_blank"
						class="text-sm text-gray-500 hover:text-black hover:underline"
					>
						View ↗
					</a>
				{/if}
				<button
					type="button"
					onclick={() => (showDetails = false)}
					class="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
					aria-label="Close details"
				>
					<X size={18} />
				</button>
			</div>
		</div>

		<div class="flex-1 space-y-5 overflow-y-auto px-6 py-6">
			<div>
				<label for="composer-date" class="block text-xs font-medium tracking-wide text-gray-500"
					>Date</label
				>
				<input
					type="date"
					id="composer-date"
					bind:value={date}
					class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
				/>
			</div>
			<div>
				<label for="composer-slug" class="block text-xs font-medium tracking-wide text-gray-500"
					>Slug</label
				>
				<input
					type="text"
					id="composer-slug"
					bind:value={slug}
					oninput={() => (slugEdited = true)}
					class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
				/>
			</div>

			{#if kind === 'blog'}
				<div>
					<label for="composer-tags" class="block text-xs font-medium tracking-wide text-gray-500"
						>Tags</label
					>
					<input
						type="text"
						id="composer-tags"
						bind:value={tagsStr}
						placeholder="tech, design..."
						class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
					/>
				</div>
			{/if}

			{#if kind === 'project'}
				<div>
					<label for="composer-tech" class="block text-xs font-medium tracking-wide text-gray-500"
						>Technologies</label
					>
					<input
						type="text"
						id="composer-tech"
						bind:value={technologiesStr}
						placeholder="Python, FastAPI, PyTorch..."
						class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
					/>
				</div>
				<div>
					<label for="composer-github" class="block text-xs font-medium tracking-wide text-gray-500"
						>GitHub URL</label
					>
					<input
						type="url"
						id="composer-github"
						bind:value={github}
						placeholder="https://github.com/..."
						class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
					/>
				</div>
				<div>
					<label for="composer-live" class="block text-xs font-medium tracking-wide text-gray-500"
						>Live Demo URL</label
					>
					<input
						type="url"
						id="composer-live"
						bind:value={live}
						placeholder="https://..."
						class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
					/>
				</div>
			{/if}

			<div>
				<label
					for="composer-description"
					class="block text-xs font-medium tracking-wide text-gray-500">Description</label
				>
				<textarea
					id="composer-description"
					rows="3"
					bind:value={description}
					placeholder="Brief summary shown on cards..."
					class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
				></textarea>
			</div>

			{#if kind === 'memory'}
				{#if memoryImages.length > 0}
					<div>
						<label
							for="composer-cover"
							class="block text-xs font-medium tracking-wide text-gray-500">Cover Image</label
						>
						<select
							id="composer-cover"
							bind:value={coverImage}
							class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
						>
							{#each memoryImages as img, i (img.url)}
								<option value={img.url}>Image {i + 1}</option>
							{/each}
						</select>
						{#if coverImage}
							<img
								src={coverImage}
								alt="Cover preview"
								class="mt-2 h-24 w-full rounded-sm border object-cover"
							/>
						{/if}
					</div>
					<div>
						<label for="composer-hero" class="block text-xs font-medium tracking-wide text-gray-500"
							>Hero Image</label
						>
						<select
							id="composer-hero"
							bind:value={heroImage}
							class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
						>
							{#each memoryImages as img, i (img.url)}
								<option value={img.url}>Image {i + 1}</option>
							{/each}
						</select>
						{#if heroImage}
							<img
								src={heroImage}
								alt="Hero preview"
								class="mt-2 h-24 w-full rounded-sm border object-cover"
							/>
						{/if}
					</div>
				{:else}
					<p class="text-xs text-gray-400">Upload photos first to pick cover & hero images.</p>
				{/if}
			{:else}
				<div>
					<span class="block text-xs font-medium tracking-wide text-gray-500">Featured Image</span>
					<div class="mt-1 space-y-2">
						{#if featuredImage}
							<div class="group relative">
								<img
									src={featuredImage}
									alt="Featured"
									class="h-32 w-full rounded-sm border object-cover"
								/>
								<button
									type="button"
									onclick={() => (featuredImage = '')}
									class="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
									aria-label="Remove image"
								>
									<X size={12} />
								</button>
							</div>
						{/if}
						<ImageUploader folder={cfg.featuredFolder} onUploadComplete={handleFeaturedUpload} />
					</div>
				</div>
			{/if}

			{#if error}
				<div class="rounded-sm bg-red-50 p-2 text-xs text-red-600">{error}</div>
			{/if}
		</div>
	</aside>
{/if}

<style>
	/* Pure CSS entry animations (svelte outros can hang teardown of fixed overlays) */
	.overlay-backdrop {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		animation: overlay-fade 0.2s ease-out;
	}

	.overlay-panel {
		animation: panel-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.drawer-backdrop {
		background: rgba(0, 0, 0, 0.25);
		animation: overlay-fade 0.15s ease-out;
	}

	.drawer-panel {
		animation: drawer-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes overlay-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes panel-pop {
		from {
			opacity: 0;
			transform: scale(0.94);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes drawer-slide {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.overlay-backdrop,
		.overlay-panel,
		.drawer-backdrop,
		.drawer-panel {
			animation: none;
		}
	}
</style>
