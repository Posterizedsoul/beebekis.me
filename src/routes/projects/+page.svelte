<script lang="ts">
	import type { PageData } from './$types';
	import AdminAddButton from '$lib/components/AdminAddButton.svelte';
	import ProjectContent from '$lib/components/ProjectContent.svelte';
	import ImageLightbox, {
		collectImages,
		type LightboxImage
	} from '$lib/components/ImageLightbox.svelte';
	import { Github, ExternalLink, ArrowLeft, X, ChevronDown } from 'lucide-svelte';
	import { auth } from '$lib/firebase';

	let { data }: { data: PageData } = $props();

	let selectedSlug: string | null = $state(null);
	let selected = $derived(data.projects?.find((p) => p.slug === selectedSlug) ?? null);
	let readerScroller: HTMLElement | undefined = $state();
	let railEl: HTMLElement | undefined = $state();
	let railHasMore = $state(false);

	function updateRailMore() {
		railHasMore = !!railEl && railEl.scrollHeight - railEl.scrollTop - railEl.clientHeight > 8;
	}

	// Re-check the "more below" hint whenever the reader opens or switches
	$effect(() => {
		void selectedSlug;
		setTimeout(() => {
			updateRailMore();
			updateBlob();
		}, 80);
	});

	// For the sliding blob animation in the rail
	let activeRailRef: HTMLElement | null = $state(null);
	let blobTop = $state(0);
	let blobHeight = $state(0);

	function updateBlob() {
		if (activeRailRef) {
			blobTop = activeRailRef.offsetTop;
			blobHeight = activeRailRef.offsetHeight;
		}
	}

	function setActiveRailRef(node: HTMLElement, isActive: boolean) {
		if (isActive) {
			activeRailRef = node;
			updateBlob();
		}
		return {
			update(newIsActive: boolean) {
				if (newIsActive) {
					activeRailRef = node;
					updateBlob();
				}
			}
		};
	}

	let lightboxOpen = $state(false);
	let lightboxImages: LightboxImage[] = $state([]);
	let lightboxIndex = $state(0);

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric'
		});
	}

	// Card click expands the project into the overlay panel.
	// Modifier-clicks (new tab) still follow the real link.
	function openProject(e: MouseEvent, slug: string) {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		e.preventDefault();
		selectedSlug = slug;
	}

	function closeReader() {
		selectedSlug = null;
	}

	let isLoggedIn = $state(false);
	
	$effect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			isLoggedIn = !!user;
		});
		return unsubscribe;
	});

	// For inline editor
	let composerOpen = $state(false);
	let editingId = $state<string | null>(null);
	let Composer: any = $state(null);

	async function openEditor(id: string) {
		editingId = id;
		if (!Composer) {
			const mod = await import('$lib/components/EntryComposer.svelte');
			Composer = mod.default;
		}
		composerOpen = true;
	}

	function handleEditorClose() {
		composerOpen = false;
		editingId = null;
		closeReader();
	}

	// Reset the panel's scroll position when switching projects
	$effect(() => {
		void selectedSlug;
		if (readerScroller) readerScroller.scrollTop = 0;
	});

	// Lock page scroll while the reader panel is open
	$effect(() => {
		if (!selectedSlug) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && selectedSlug && !lightboxOpen) closeReader();
	}

	function handleContentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName !== 'IMG') return;
		const container = e.currentTarget as HTMLElement;
		lightboxImages = collectImages(container);
		lightboxIndex = Array.from(container.querySelectorAll('img')).indexOf(
			target as HTMLImageElement
		);
		lightboxOpen = true;
	}

	function openGallery(i: number) {
		if (!selected?.galleryImages) return;
		lightboxImages = selected.galleryImages.map((img) => ({ url: img.url, alt: img.alt }));
		lightboxIndex = i;
		lightboxOpen = true;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>Projects - Bibek Bhatta</title>
	<meta
		name="description"
		content="Projects by Bibek Bhatta in Machine Learning, Computer Vision, and Web Development."
	/>
</svelte:head>

<!-- Large side text -->
<div
	class="pointer-events-none fixed top-0 left-0 z-10 hidden h-screen flex-col items-center justify-center pl-10 md:pl-20 xl:flex"
>
	{#each 'PROJECTS' as letter, i (i)}
		<span class="block text-7xl leading-none font-bold tracking-tighter text-gray-300 xl:text-8xl"
			>{letter}</span
		>
	{/each}
</div>

<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
	<div class="mb-8 flex justify-end">
		<AdminAddButton kind="project" label="Add Project" />
	</div>
	{#if data.projects && data.projects.length > 0}
		<div class="space-y-16">
			{#each data.projects as project (project.slug)}
				{@const previews = (project.galleryPreviews || []).slice(0, 4)}
				<article class="group">
					<a
						href="/projects/{project.slug}"
						class="block"
						onclick={(e) => openProject(e, project.slug)}
					>
						<!-- Image Hero -->
						{#if previews.length > 0}
							<div
								class="relative mb-6 overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-2xl"
							>
								<div class="flex h-64 md:h-80 lg:h-96">
									{#each previews as preview, i (preview.src)}
										<div class="relative h-full flex-1 overflow-hidden">
											<img
												src={preview.src}
												alt=""
												class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
												loading="lazy" decoding="async"
											/>
											{#if i < previews.length - 1}
												<div class="absolute top-0 right-0 bottom-0 z-10 w-px bg-white/30"></div>
											{/if}
										</div>
									{/each}
								</div>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
								></div>
								<div class="absolute right-0 bottom-0 left-0 p-6 md:p-8">
									<h2
										class="text-shadow text-3xl font-bold tracking-wide text-white uppercase md:text-4xl lg:text-5xl"
									>
										{project.title}
									</h2>
									<p class="text-shadow mt-2 text-sm text-gray-200">
										{formatDate(project.date)}
									</p>
								</div>
							</div>
						{:else if project.featuredImage}
							<div
								class="relative mb-6 h-64 overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-2xl md:h-80 lg:h-96"
							>
								<img
									src={project.featuredImage}
									alt={project.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									loading="lazy" decoding="async"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
								></div>
								<div class="absolute right-0 bottom-0 left-0 p-6 md:p-8">
									<h2
										class="text-shadow text-3xl font-bold tracking-wide text-white uppercase md:text-4xl lg:text-5xl"
									>
										{project.title}
									</h2>
									<p class="text-shadow mt-2 text-sm text-gray-200">
										{formatDate(project.date)}
									</p>
								</div>
							</div>
						{:else}
							<div
								class="mb-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 group-hover:shadow-lg md:p-10"
							>
								<h2
									class="font-serif text-2xl font-bold text-gray-900 uppercase md:text-3xl lg:text-4xl"
								>
									{project.title}
								</h2>
								<p class="mt-2 text-sm text-gray-600">
									{formatDate(project.date)}
								</p>
							</div>
						{/if}

						<!-- Description & Tech -->
						<div class="space-y-4">
							{#if project.description}
								<p class="text-lg text-gray-700 transition-colors group-hover:text-gray-900">
									{project.description}
								</p>
							{/if}

							<div class="flex flex-wrap items-center gap-2">
								{#if project.technologies && project.technologies.length > 0}
									{#each project.technologies as tech (tech)}
										<span
											class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600 transition-colors group-hover:border-gray-300 group-hover:bg-gray-100"
										>
											{tech}
										</span>
									{/each}
								{/if}
								<span
									class="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors group-hover:text-black"
								>
									Read →
								</span>
							</div>
						</div>
					</a>
				</article>
			{/each}
		</div>
	{:else}
		<p class="text-center text-gray-500">No projects yet!</p>
	{/if}
</div>

<!-- ============ Reader overlay (Prime-style expand) ============ -->
{#if selected}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="overlay-backdrop fixed inset-0 z-[80]" onclick={closeReader}></div>

	<div
		class="pointer-events-none fixed inset-0 z-[85] flex items-center justify-center gap-4 p-3 md:p-8"
	>
		<!-- Spacer mirrors the rail so the panel sits dead-center -->
		<div class="hidden w-64 flex-shrink-0 lg:block" aria-hidden="true"></div>

		<div
			class="overlay-panel pointer-events-auto relative flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
		>
			<!-- Close -->
			<button
				type="button"
				onclick={closeReader}
				class="absolute top-3 right-3 z-20 rounded-full cursor-pointer bg-white/90 p-1.5 text-red-500 shadow-md backdrop-blur transition-all hover:bg-red-100 hover:text-red-600 hover:scale-110"
				aria-label="Close"
			>
				<X size={28} />
			</button>

			<!-- Main reading column -->
			<div class="no-scrollbar min-w-0 flex-1 overflow-y-auto" bind:this={readerScroller}>
				<!-- Hero: images in the back, title in front (like the cards) -->
				{#if selected.galleryImages && selected.galleryImages.length > 0}
					<div class="relative">
						<div class="flex h-80 md:h-96 lg:h-[32rem]">
							{#each selected.galleryImages.slice(0, 4) as img, i (img.url)}
								<button
									type="button"
									onclick={() => openGallery(i)}
									class="relative h-full flex-1 overflow-hidden"
									aria-label="View image"
								>
									<img
										src={img.thumb}
										alt={img.alt}
										class="absolute inset-0 h-full w-full object-cover"
									/>
								</button>
							{/each}
						</div>
						<div
							class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
						></div>
						<div class="pointer-events-none absolute right-0 bottom-0 left-0 p-6 md:p-8">
							<h1
								class="text-shadow font-serif text-3xl font-bold tracking-wide text-white uppercase md:text-4xl"
							>
								{selected.title}
							</h1>
							<p class="text-shadow mt-2 text-sm text-gray-200">{formatDate(selected.date)}</p>
						</div>
					</div>
				{:else if selected.featuredImage}
					<div class="relative">
						<img
							src={selected.featuredImage}
							alt={selected.title}
							class="h-80 w-full object-cover md:h-96 lg:h-[32rem]"
						/>
						<div
							class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
						></div>
						<div class="pointer-events-none absolute right-0 bottom-0 left-0 p-6 md:p-8">
							<h1
								class="text-shadow font-serif text-3xl font-bold tracking-wide text-white uppercase md:text-4xl"
							>
								{selected.title}
							</h1>
							<p class="text-shadow mt-2 text-sm text-gray-200">{formatDate(selected.date)}</p>
						</div>
					</div>
				{/if}

				<div class="px-6 py-4 md:px-10 md:py-6">
					<!-- Mobile project switcher -->
					<div class="mb-4 flex items-center gap-2 overflow-x-auto pb-2 lg:hidden">
						{#each data.projects as p (p.slug)}
							<button
								type="button"
								onclick={() => (selectedSlug = p.slug)}
								class="flex-shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors {p.slug ===
								selectedSlug
									? 'border-black bg-black text-white'
									: 'border-gray-300 text-gray-600'}"
							>
								{p.title}
							</button>
						{/each}
					</div>

					<!-- Header (title moves here when there is no image to carry it) -->
					<header
						class="mb-4 border-b border-gray-200 pb-4 {selected.galleryImages?.length ||
						selected.featuredImage
							? ''
							: 'pr-10'}"
					>
						{#if !(selected.galleryImages && selected.galleryImages.length > 0) && !selected.featuredImage}
							<h1
								class="font-serif text-3xl font-bold tracking-wide text-black uppercase md:text-4xl"
							>
								{selected.title}
							</h1>
							<p class="mt-2 mb-4 text-sm text-gray-500">{formatDate(selected.date)}</p>
						{/if}

						{#if selected.description}
							<p class="text-lg leading-relaxed text-gray-700">{selected.description}</p>
						{/if}

						<div class="mt-4 flex flex-wrap items-center gap-2">
							{#if selected.technologies && selected.technologies.length > 0}
								{#each selected.technologies as tech (tech)}
									<span
										class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600"
									>
										{tech}
									</span>
								{/each}
							{/if}
							{#if selected.github}
								<a
									href={selected.github}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-2 rounded-sm border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
								>
									<Github size={15} /> Code
								</a>
							{/if}
							{#if selected.live}
								<a
									href={selected.live}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-2 rounded-sm border border-black bg-white px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-gray-100"
								>
									<ExternalLink size={15} /> Live Demo
								</a>
							{/if}
						</div>
					</header>

					<div class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
						<button
							type="button"
							onclick={closeReader}
							class="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-black hover:underline"
						>
							<ArrowLeft size={15} /> All Projects
						</button>
						<div class="flex items-center gap-4">
							{#if isLoggedIn && selected.id}
								<button
									type="button"
									onclick={() => openEditor(selected.id)}
									class="group relative inline-block pb-1 cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-black"
								>
									<span>✏️ Edit</span>
									<span class="absolute bottom-0 left-0 block h-[1.5px] w-full origin-left scale-x-0 transform bg-black transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
								</button>
							{/if}
							<a
								href="/projects/{selected.slug}"
								class="text-sm font-medium cursor-pointer text-gray-500 transition-colors hover:text-black hover:underline"
							>
								Open full page ↗
							</a>
						</div>
					</div>

					<!-- Write-up -->
					{#if selected.contentHtml}
						<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
						<div onclick={handleContentClick}>
							<ProjectContent html={selected.contentHtml} />
						</div>
					{:else}
						<p class="text-gray-500 italic">No write-up yet.</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Floating rail of other projects, on the side of the panel -->
		<div class="relative hidden w-64 flex-shrink-0 lg:block">
			<aside
				bind:this={railEl}
				onscroll={updateRailMore}
				class="no-scrollbar pointer-events-auto max-h-[90vh] overflow-y-auto"
			>
				<p
					class="text-shadow mb-3 font-serif text-xs font-semibold tracking-widest text-white/80 uppercase"
				>
					Projects
				</p>
				<nav class="relative space-y-3 pr-1 z-0">
					<!-- Active sliding blob (ring style for image cards) -->
					<div
						class="absolute left-0 top-0 w-[calc(100%-0.25rem)] rounded-lg ring-2 ring-white shadow-xl pointer-events-none z-10"
						style="transform: translateY({blobTop}px); height: {blobHeight}px; opacity: {blobHeight > 0 ? 1 : 0}; transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s; will-change: transform, height;"
					></div>

					{#each data.projects as p, i (p.slug)}
						{@const isActive = p.slug === selectedSlug}
						{@const thumb = p.galleryPreviews?.[0]?.src || p.featuredImage}
						<button
							type="button"
							use:setActiveRailRef={isActive}
							onclick={() => (selectedSlug = p.slug)}
							style="animation-delay: {i * 50}ms"
							class="rail-item group relative z-0 block cursor-pointer w-full overflow-hidden rounded-lg text-left shadow-lg transition-opacity duration-300 {isActive
								? 'opacity-100 shadow-none'
								: 'opacity-70 hover:opacity-100'}"
						>
							{#if thumb}
								<img src={thumb} alt="" class="h-16 w-full object-cover" loading="lazy" decoding="async" />
								<div class="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10"></div>
								<span
									class="text-shadow absolute right-2 bottom-1.5 left-2 truncate text-xs font-semibold tracking-wide text-white uppercase"
								>
									{p.title}
								</span>
							{:else}
								<span
									class="flex h-16 w-full items-end rounded-lg bg-white p-2 text-xs font-semibold tracking-wide text-gray-700 uppercase"
								>
									{p.title}
								</span>
							{/if}
						</button>
					{/each}
				</nav>
			</aside>

			<!-- More entries below -->
			{#if railHasMore}
				<div class="pointer-events-none absolute right-0 -bottom-8 left-0 flex justify-center">
					<ChevronDown size={20} class="animate-bounce text-white/90 drop-shadow" />
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if lightboxOpen}
	<ImageLightbox
		images={lightboxImages}
		startIndex={lightboxIndex}
		onClose={() => (lightboxOpen = false)}
	/>
{/if}

<!-- Inline editor (lazy-loaded) -->
{#if composerOpen && Composer}
	<svelte:component this={Composer} kind="project" docId={editingId} onClose={handleEditorClose} />
{/if}

<style>
	.text-shadow {
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	/* Prime-style expand: pure CSS entry animations (reliable teardown, instant close) */
	.overlay-backdrop {
		background: rgba(0, 0, 0, 0.6);
		animation: overlay-fade 0.2s ease-out;
	}

	@media (min-width: 768px) {
		.overlay-backdrop {
			backdrop-filter: blur(4px);
		}
	}

	.overlay-panel {
		animation: panel-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.overlay-backdrop,
		.overlay-panel {
			animation: none;
		}
	}

	/* Scroll without visible scrollbars inside the popup */
	.no-scrollbar {
		scrollbar-width: none;
	}

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	/* Rail pills settle in one after another, and lift on hover */
	.rail-item {
		animation: rail-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
		transition:
			transform 0.2s ease,
			opacity 0.2s ease,
			box-shadow 0.2s ease;
	}

	.rail-item:hover {
		transform: translateX(-4px) scale(1.03);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	@keyframes rail-in {
		from {
			opacity: 0;
			transform: translateX(24px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rail-item {
			animation: none;
			transition: none;
		}
	}
</style>
