<script lang="ts">
	import type { PageData } from './$types';
	import { Github, ExternalLink, ChevronLeft, X } from 'lucide-svelte';
	import AdminEditButton from '$lib/components/AdminEditButton.svelte';

	let { data }: { data: PageData } = $props();

	// Lightbox state
	let lightboxOpen = $state(false);
	let lightboxSrc = $state('');
	let lightboxAlt = $state('');

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		});
	}

	function openLightbox(src: string, alt: string) {
		lightboxSrc = src;
		lightboxAlt = alt;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
	}

	// Handle clicks on images within the prose content
	function handleContentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName === 'IMG') {
			const img = target as HTMLImageElement;
			openLightbox(img.src, img.alt);
		}
	}
</script>

<svelte:head>
	<title>{data.metadata.title} - Projects</title>
	<meta
		name="description"
		content={data.metadata.description || `Project: ${data.metadata.title}`}
	/>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<article class="min-h-screen bg-white">
	<!-- Clean Header - No big image -->
	<header class="mx-auto max-w-5xl px-6 pb-8 pt-12 md:pt-16">
		<a
			href="/projects"
			class="mb-6 inline-flex items-center text-sm text-gray-400 transition-colors hover:text-gray-700"
		>
			<ChevronLeft size={16} class="mr-1" />
			All Projects
		</a>

		<h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
			{data.metadata.title}
		</h1>

		<div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
			<time datetime={data.metadata.date}>
				{formatDate(data.metadata.date)}
			</time>

			{#if data.metadata.github || data.metadata.live}
				<span class="text-gray-300">•</span>
				<div class="flex gap-4">
					{#if data.metadata.github}
						<a
							href={data.metadata.github}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-black"
						>
							<Github size={18} />
							<span>View Code</span>
						</a>
					{/if}
					{#if data.metadata.live}
						<a
							href={data.metadata.live}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-black"
						>
							<ExternalLink size={18} />
							<span>Live Demo</span>
						</a>
					{/if}
				</div>
			{/if}
		</div>

		{#if data.metadata.technologies && data.metadata.technologies.length > 0}
			<div class="mt-6 flex flex-wrap gap-2">
				{#each data.metadata.technologies as tech}
					<span class="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700">
						{tech}
					</span>
				{/each}
			</div>
		{/if}

		{#if data.metadata.description}
			<p class="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
				{data.metadata.description}
			</p>
		{/if}
	</header>

	<!-- Content - PPT style with large images -->
	{#if data.contentHtml}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="project-content mx-auto max-w-5xl px-6 pb-20" onclick={handleContentClick}>
			{@html data.contentHtml}
		</div>
	{/if}
</article>

<!-- Lightbox -->
{#if lightboxOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
		onclick={closeLightbox}
		role="dialog"
		aria-modal="true"
	>
		<button
			type="button"
			class="absolute right-4 top-4 z-10 text-white/70 transition-colors hover:text-white"
			onclick={closeLightbox}
			aria-label="Close lightbox"
		>
			<X size={32} />
		</button>

		<img src={lightboxSrc} alt={lightboxAlt} class="max-h-[95vh] max-w-[95vw] object-contain" />
	</div>
{/if}

<!-- Edit button for logged-in users -->
<AdminEditButton href="/admin/projects/{data.id}" label="Edit Project" />

<style>
	/* PPT-style content - image-focused, minimal text styling */
	:global(.project-content) {
		font-size: 1.125rem;
		line-height: 1.8;
		color: #374151;
	}

	:global(.project-content p) {
		margin-bottom: 1.5rem;
		max-width: 48rem;
	}

	:global(.project-content h2) {
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
		margin-top: 3rem;
		margin-bottom: 1rem;
	}

	:global(.project-content h3) {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
		margin-top: 2.5rem;
		margin-bottom: 0.75rem;
	}

	/* Single images - large and centered */
	:global(.project-content > p > img),
	:global(.project-content > img) {
		display: block;
		width: 100%;
		max-width: 100%;
		height: auto;
		border-radius: 12px;
		margin: 2rem auto;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	:global(.project-content img:hover) {
		transform: scale(1.01);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	/* Image gallery - masonry layout like memories page */
	:global(.project-content .image-gallery) {
		column-count: 2;
		column-gap: 1rem;
		margin: 2rem 0;
		width: 100%;
		max-width: 100%;
	}

	@media (min-width: 768px) {
		:global(.project-content .image-gallery) {
			column-count: 2;
		}
	}

	@media (min-width: 1024px) {
		:global(.project-content .image-gallery) {
			column-count: 3;
		}
	}

	:global(.project-content .image-gallery img) {
		width: 100%;
		height: auto;
		margin: 0 0 1rem 0;
		break-inside: avoid;
		display: block;
		border-radius: 12px;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s,
			box-shadow 0.2s,
			opacity 0.2s;
	}

	:global(.project-content .image-gallery img:hover) {
		transform: scale(1.02);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
		opacity: 0.95;
	}

	/* Links */
	:global(.project-content a) {
		color: #2563eb;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	:global(.project-content a:hover) {
		color: #1d4ed8;
	}

	/* Lists */
	:global(.project-content ul),
	:global(.project-content ol) {
		margin: 1.5rem 0;
		padding-left: 1.5rem;
	}

	:global(.project-content li) {
		margin-bottom: 0.5rem;
	}

	/* Code blocks */
	:global(.project-content pre) {
		background: #1f2937;
		color: #e5e7eb;
		padding: 1.5rem;
		border-radius: 12px;
		overflow-x: auto;
		margin: 2rem 0;
	}

	:global(.project-content code) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.9em;
	}

	/* Blockquotes */
	:global(.project-content blockquote) {
		border-left: 4px solid #e5e7eb;
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: #6b7280;
	}
</style>
