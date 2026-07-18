<script lang="ts">
	import type { PageData } from './$types';
	import { slide } from 'svelte/transition';
	import AdminAddButton from '$lib/components/AdminAddButton.svelte';
	import ProjectContent from '$lib/components/ProjectContent.svelte';
	import ImageLightbox, {
		collectImages,
		type LightboxImage
	} from '$lib/components/ImageLightbox.svelte';
	import { Github, ExternalLink, ChevronDown } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let expandedSlug: string | null = $state(null);

	let lightboxOpen = $state(false);
	let lightboxImages: LightboxImage[] = $state([]);
	let lightboxIndex = $state(0);

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric'
		});
	}

	// Card click expands the project in place instead of navigating away.
	// Modifier-clicks (new tab) still follow the real link.
	function toggle(e: MouseEvent, slug: string) {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		e.preventDefault();
		expandedSlug = expandedSlug === slug ? null : slug;
		if (expandedSlug) {
			setTimeout(() => {
				document
					.getElementById(`project-${slug}`)
					?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 80);
		}
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
</script>

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
				{@const isExpanded = expandedSlug === project.slug}
				<article class="group scroll-mt-24" id="project-{project.slug}">
					<a href="/projects/{project.slug}" class="block" onclick={(e) => toggle(e, project.slug)}>
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
								<!-- Gradient overlay -->
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
								></div>

								<!-- Title on image -->
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
							<!-- No image fallback -->
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
									{isExpanded ? 'Collapse' : 'Read more'}
									<span
										class="inline-block transition-transform duration-300 {isExpanded
											? 'rotate-180'
											: ''}"><ChevronDown size={16} /></span
									>
								</span>
							</div>
						</div>
					</a>

					<!-- Inline expansion: the full write-up, no navigation needed -->
					{#if isExpanded}
						<div transition:slide={{ duration: 300 }}>
							<div class="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
								{#if project.github || project.live}
									<div class="mb-8 flex flex-wrap gap-3">
										{#if project.github}
											<a
												href={project.github}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center gap-2 rounded-sm border border-black bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
											>
												<Github size={16} /> Code
											</a>
										{/if}
										{#if project.live}
											<a
												href={project.live}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center gap-2 rounded-sm border border-black bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
											>
												<ExternalLink size={16} /> Live Demo
											</a>
										{/if}
									</div>
								{/if}

								{#if project.contentHtml}
									<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
									<div onclick={handleContentClick}>
										<ProjectContent html={project.contentHtml} />
									</div>
								{:else}
									<p class="text-gray-500 italic">No write-up yet.</p>
								{/if}

								<div class="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
									<a
										href="/projects/{project.slug}"
										class="text-sm font-medium text-gray-500 transition-colors hover:text-black hover:underline"
									>
										Open full page ↗
									</a>
									<button
										type="button"
										onclick={() => (expandedSlug = null)}
										class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black"
									>
										Collapse <span class="inline-block rotate-180"><ChevronDown size={16} /></span>
									</button>
								</div>
							</div>
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{:else}
		<p class="text-center text-gray-500">No projects yet!</p>
	{/if}
</div>

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
</style>
