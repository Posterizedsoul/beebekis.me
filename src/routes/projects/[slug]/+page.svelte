<script lang="ts">
	import type { PageData } from './$types';
	import { Github, ExternalLink, ArrowLeft, X } from 'lucide-svelte';
	import AdminEditButton from '$lib/components/AdminEditButton.svelte';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	// Simple image viewer state - just shows the clicked image enlarged
	let viewerOpen = $state(false);
	let viewerImage = $state({ url: '', alt: '' });

	// Animation state
	let mounted = $state(false);

	onMount(() => {
		// Trigger entrance animations
		setTimeout(() => (mounted = true), 50);
	});

	// Determine hero image (featured or fallback to first gallery image)
	let heroImage = $derived(
		data.metadata.featuredImage ||
			(data.images && data.images.length > 0 ? data.images[0].url : null)
	);

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		});
	}

	function closeViewer() {
		viewerOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!viewerOpen) return;
		if (e.key === 'Escape') closeViewer();
	}

	// Handle clicks on images within the prose content
	function handleContentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName === 'IMG') {
			const img = target as HTMLImageElement;
			viewerImage = { url: img.src, alt: img.alt || 'Project image' };
			viewerOpen = true;
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

<article class="project-page">
	<!-- Hero Section -->
	<header class="relative mb-12 h-[60vh] w-full overflow-hidden">
		{#if heroImage}
			<img
				src={heroImage}
				alt={data.metadata.title}
				class="absolute inset-0 h-full w-full object-cover"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
			></div>
		{:else}
			<div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
		{/if}

		<!-- Content Overlay -->
		<div class="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-7xl p-6 text-white md:p-12">
			<a
				href="/projects"
				class="back-link mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
			>
				<ArrowLeft size={16} /> <span>All Projects</span>
			</a>

			<h1
				class="text-shadow mb-4 text-5xl font-bold uppercase tracking-wide md:text-7xl lg:text-8xl"
			>
				{data.metadata.title}
			</h1>

			<div class="mb-6 flex flex-wrap items-center gap-6 text-white/90">
				<!-- Date -->
				<time datetime={data.metadata.date} class="text-sm font-medium">
					{formatDate(data.metadata.date)}
				</time>

				<!-- Tech Badges -->
				{#if data.metadata.technologies && data.metadata.technologies.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each data.metadata.technologies as tech}
							<span class="tech-badge">{tech}</span>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Links -->
			{#if data.metadata.github || data.metadata.live}
				<div class="links">
					{#if data.metadata.github}
						<a
							href={data.metadata.github}
							target="_blank"
							rel="noopener noreferrer"
							class="link-btn"
						>
							<Github size={18} /> Code
						</a>
					{/if}
					{#if data.metadata.live}
						<a href={data.metadata.live} target="_blank" rel="noopener noreferrer" class="link-btn">
							<ExternalLink size={18} /> Live Demo
						</a>
					{/if}
				</div>
			{/if}
		</div>
	</header>

	<!-- Content Section -->
	<div class="content-section" onclick={handleContentClick}>
		<!-- Description -->
		{#if data.metadata.description}
			<div class="description-container">
				<p class="description">{data.metadata.description}</p>
			</div>
		{/if}

		{#if data.contentHtml}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div class="prose-content">
				{@html data.contentHtml}
			</div>
		{/if}
	</div>
</article>

<!-- Image Viewer - shows clicked image enlarged -->
{#if viewerOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="lightbox" onclick={closeViewer} role="dialog" aria-modal="true">
		<div class="lightbox-container" onclick={(e) => e.stopPropagation()}>
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
			<img src={viewerImage.url} alt={viewerImage.alt} class="lightbox-img" />
			<button type="button" class="lightbox-close" onclick={closeViewer} aria-label="Close">
				<X size={20} />
			</button>
		</div>
	</div>
{/if}

<!-- Edit button for logged-in users -->
<AdminEditButton href="/admin/projects/{data.id}" label="Edit Project" />

<style>
	/* ===== Page Layout ===== */
	.project-page {
		min-height: 100vh;
		background: #fafafa;
	}

	/* Force full width for the hero image container */
	:global(body) {
		overflow-x: hidden;
	}

	/* Text Shadow Utility */
	.text-shadow {
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	}

	/* ===== Content Section ===== */
	.content-section {
		padding: 3rem 1.5rem 5rem;
		background: #fafafa;
	}

	.description-container {
		max-width: 48rem;
		margin: 0 auto 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.description {
		font-size: 1.25rem;
		line-height: 1.7;
		color: #475569;
	}

	.tech-badge {
		padding: 0.25rem 0.75rem;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(4px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.links {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.link-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 9999px;
		color: #0f172a;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.link-btn:hover {
		background: #fff;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	/* ===== Content Section ===== */
	.content-section {
		padding: 3rem 1.5rem 5rem;
		background: #fafafa;
	}

	@media (min-width: 768px) {
		.content-section {
			padding: 4rem 2rem 6rem;
		}
	}

	.prose-content {
		max-width: 56rem;
		margin: 0 auto;
		font-size: 1.0625rem;
		line-height: 1.8;
		color: #374151;
	}

	:global(.prose-content p) {
		margin-bottom: 1.5rem;
	}

	:global(.prose-content h2) {
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
		margin-top: 3rem;
		margin-bottom: 1rem;
	}

	:global(.prose-content h3) {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
		margin-top: 2.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.prose-content img) {
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

	:global(.prose-content img:hover) {
		transform: scale(1.01);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	:global(.prose-content a) {
		color: #4f46e5;
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: color 0.2s;
	}

	:global(.prose-content a:hover) {
		color: #4338ca;
	}

	:global(.prose-content ul),
	:global(.prose-content ol) {
		margin: 1.5rem 0;
		padding-left: 1.5rem;
	}

	:global(.prose-content li) {
		margin-bottom: 0.5rem;
	}

	:global(.prose-content pre) {
		background: #1e293b;
		color: #e2e8f0;
		padding: 1.5rem;
		border-radius: 12px;
		overflow-x: auto;
		margin: 2rem 0;
	}

	:global(.prose-content code) {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.9em;
	}

	/* Masonry layout for grouped images from editor */
	:global(.prose-content .image-gallery) {
		column-count: 2;
		column-gap: 1rem;
		margin: 2rem 0;
		width: 100%;
	}

	@media (max-width: 640px) {
		:global(.prose-content .image-gallery) {
			column-count: 1;
		}
	}

	:global(.prose-content .image-gallery img) {
		width: 100%;
		height: auto;
		margin: 0 0 1rem 0;
		break-inside: avoid;
		border-radius: 12px;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	:global(.prose-content .image-gallery img:hover) {
		transform: scale(1.02);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	:global(.prose-content blockquote) {
		border-left: 4px solid #e2e8f0;
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: #64748b;
	}

	/* ===== Back Link ===== */
	.back-link span {
		position: relative;
	}

	.back-link span::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -2px;
		width: 0;
		height: 1px;
		background: currentColor;
		transition: width 0.3s ease;
	}

	.back-link:hover span::after {
		width: 100%;
	}

	/* ===== Image Viewer ===== */
	.lightbox {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.85);
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.lightbox-container {
		position: relative;
		display: inline-block;
		max-width: 90vw;
		max-height: 85vh;
	}

	.lightbox-close {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.6);
		border: none;
		border-radius: 50%;
		color: #fff;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
	}

	.lightbox-close:hover {
		background: rgba(0, 0, 0, 0.8);
		transform: scale(1.1);
	}

	.lightbox-img {
		max-width: 90vw;
		max-height: 85vh;
		object-fit: contain;
		border-radius: 8px;
		animation: zoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes zoomIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.tech-badge {
			transition: none;
		}

		.lightbox,
		.lightbox-img {
			animation: none;
		}
	}
</style>
