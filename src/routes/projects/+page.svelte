<script lang="ts">
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';
	import AdminAddButton from '$lib/components/AdminAddButton.svelte';
	import ProjectContent from '$lib/components/ProjectContent.svelte';
	import ImageLightbox, {
		collectImages,
		type LightboxImage
	} from '$lib/components/ImageLightbox.svelte';
	import { Github, ExternalLink, ArrowLeft, X } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let selectedSlug: string | null = $state(null);
	let selected = $derived(data.projects?.find((p) => p.slug === selectedSlug) ?? null);

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

	// Lock page scroll while the reader panel is open
	$effect(() => {
		if (!selected) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && selected && !lightboxOpen) closeReader();
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
	class="pointer-events-none fixed top-0 left-0 z-10 hidden h-screen flex-col items-center justify-center pl-10 md:pl-20 lg:flex"
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
												loading="lazy"
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
									loading="lazy"
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
	<div
		class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={closeReader}
	></div>

	<div class="pointer-events-none fixed inset-0 z-[85] flex items-center justify-center p-3 md:p-8">
		<div
			class="pointer-events-auto relative flex h-[88vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl"
			transition:scale={{ start: 0.9, duration: 280, opacity: 0 }}
		>
			<!-- Close -->
			<button
				type="button"
				onclick={closeReader}
				class="absolute top-3 right-3 z-20 rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur transition-colors hover:bg-gray-100 hover:text-black"
				aria-label="Close"
			>
				<X size={18} />
			</button>

			<!-- Main reading column (scrolls internally) -->
			{#key selectedSlug}
				<div class="min-w-0 flex-1 overflow-y-auto" in:fade={{ duration: 180 }}>
					<div class="px-6 py-8 md:px-10 md:py-10">
						<!-- Mobile project switcher -->
						<div class="mb-6 flex items-center gap-2 overflow-x-auto pb-2 lg:hidden">
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

						<!-- Header -->
						<header class="mb-8 border-b border-gray-200 pb-8">
							<h1
								class="pr-10 font-serif text-3xl font-bold tracking-wide text-black uppercase md:text-4xl lg:text-5xl"
							>
								{selected.title}
							</h1>
							<p class="mt-3 text-sm text-gray-500">{formatDate(selected.date)}</p>

							{#if selected.description}
								<p class="mt-4 text-lg leading-relaxed text-gray-700">{selected.description}</p>
							{/if}

							{#if selected.technologies && selected.technologies.length > 0}
								<div class="mt-5 flex flex-wrap items-center gap-2">
									{#each selected.technologies as tech (tech)}
										<span
											class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600"
										>
											{tech}
										</span>
									{/each}
								</div>
							{/if}

							{#if selected.github || selected.live}
								<div class="mt-6 flex flex-wrap gap-3">
									{#if selected.github}
										<a
											href={selected.github}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-2 rounded-sm border border-black bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
										>
											<Github size={16} /> Code
										</a>
									{/if}
									{#if selected.live}
										<a
											href={selected.live}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-2 rounded-sm border border-black bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
										>
											<ExternalLink size={16} /> Live Demo
										</a>
									{/if}
								</div>
							{/if}
						</header>

						<!-- Write-up -->
						{#if selected.contentHtml}
							<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
							<div onclick={handleContentClick}>
								<ProjectContent html={selected.contentHtml} />
							</div>
						{:else}
							<p class="text-gray-500 italic">No write-up yet.</p>
						{/if}

						<!-- Gallery -->
						{#if selected.galleryImages && selected.galleryImages.length > 0}
							<section class="mt-12">
								<h3
									class="mb-4 font-serif text-sm font-semibold tracking-widest text-gray-900 uppercase"
								>
									Gallery
								</h3>
								<div class="gallery-strip">
									{#each selected.galleryImages as img, i (img.url)}
										<button type="button" onclick={() => openGallery(i)} aria-label="View image">
											<img src={img.thumb} alt={img.alt} loading="lazy" />
										</button>
									{/each}
								</div>
							</section>
						{/if}

						<!-- Footer -->
						<footer class="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
							<button
								type="button"
								onclick={closeReader}
								class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-black"
							>
								<ArrowLeft size={15} /> All Projects
							</button>
							<a
								href="/projects/{selected.slug}"
								class="text-sm font-medium text-gray-500 transition-colors hover:text-black hover:underline"
							>
								Open full page ↗
							</a>
						</footer>
					</div>
				</div>
			{/key}

			<!-- Thumbnail rail: other projects, one click away -->
			<aside
				class="hidden w-56 flex-shrink-0 overflow-y-auto border-l border-gray-100 bg-gray-50/60 p-4 lg:block"
			>
				<p class="mb-3 font-serif text-xs font-semibold tracking-widest text-gray-500 uppercase">
					Projects
				</p>
				<nav class="space-y-3">
					{#each data.projects as p (p.slug)}
						{@const thumb = p.galleryPreviews?.[0]?.src || p.featuredImage}
						<button
							type="button"
							onclick={() => (selectedSlug = p.slug)}
							class="group relative block w-full overflow-hidden rounded-lg text-left transition-all {p.slug ===
							selectedSlug
								? 'ring-2 ring-black'
								: 'opacity-75 hover:opacity-100 hover:shadow-md'}"
						>
							{#if thumb}
								<img src={thumb} alt="" class="h-20 w-full object-cover" loading="lazy" />
								<div class="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10"></div>
								<span
									class="text-shadow absolute right-2 bottom-1.5 left-2 truncate text-xs font-semibold tracking-wide text-white uppercase"
								>
									{p.title}
								</span>
							{:else}
								<span
									class="flex h-20 w-full items-end rounded-lg border border-gray-200 bg-white p-2 text-xs font-semibold tracking-wide text-gray-700 uppercase"
								>
									{p.title}
								</span>
							{/if}
						</button>
					{/each}
				</nav>
			</aside>
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

<style>
	.text-shadow {
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	/* Memories-style collage strip for the gallery */
	.gallery-strip {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		border-radius: 12px;
		overflow: hidden;
	}

	.gallery-strip button {
		flex: 1 1 200px;
		min-width: 0;
		height: 260px;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
	}

	.gallery-strip img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: filter 0.25s ease;
	}

	.gallery-strip button:hover img {
		filter: brightness(1.08);
	}

	@media (max-width: 640px) {
		.gallery-strip button {
			flex-basis: 130px;
			height: 180px;
		}
	}
</style>
