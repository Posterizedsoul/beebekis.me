<script lang="ts">
	import type { PageData } from './$types';
	import AdminAddButton from '$lib/components/AdminAddButton.svelte';

	let { data }: { data: PageData } = $props();

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric'
		});
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
	class="pointer-events-none fixed left-0 top-0 z-10 hidden h-screen flex-col items-center justify-center pl-10 md:pl-20 lg:flex"
>
	<span class="block text-7xl font-bold leading-none tracking-tighter text-gray-300 xl:text-8xl"
		>P</span
	>
	<span class="block text-7xl font-bold leading-none tracking-tighter text-gray-300 xl:text-8xl"
		>R</span
	>
	<span class="block text-7xl font-bold leading-none tracking-tighter text-gray-300 xl:text-8xl"
		>O</span
	>
	<span class="block text-7xl font-bold leading-none tracking-tighter text-gray-300 xl:text-8xl"
		>J</span
	>
	<span class="block text-7xl font-bold leading-none tracking-tighter text-gray-300 xl:text-8xl"
		>E</span
	>
	<span class="block text-7xl font-bold leading-none tracking-tighter text-gray-300 xl:text-8xl"
		>C</span
	>
	<span class="block text-7xl font-bold leading-none tracking-tighter text-gray-300 xl:text-8xl"
		>T</span
	>
	<span class="block text-7xl font-bold leading-none tracking-tighter text-gray-300 xl:text-8xl"
		>S</span
	>
</div>

<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
	<div class="mb-8 flex justify-end">
		<AdminAddButton href="/admin/projects/new" label="Add Project" />
	</div>
	{#if data.projects && data.projects.length > 0}
		<div class="space-y-16">
			{#each data.projects as project (project.slug)}
				{@const previews = (project.galleryPreviews || []).slice(0, 4)}
				<article class="group">
					<a href="/projects/{project.slug}" class="block">
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
												<div class="absolute bottom-0 right-0 top-0 z-10 w-px bg-white/30"></div>
											{/if}
										</div>
									{/each}
								</div>
								<!-- Gradient overlay -->
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
								></div>

								<!-- Title on image -->
								<div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
									<h2
										class="text-shadow text-3xl font-bold uppercase tracking-wide text-white md:text-4xl lg:text-5xl"
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
								<div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
									<h2
										class="text-shadow text-3xl font-bold uppercase tracking-wide text-white md:text-4xl lg:text-5xl"
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
								class="mb-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 shadow-lg transition-all duration-300 group-hover:shadow-2xl md:p-10"
							>
								<h2 class="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
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

							{#if project.technologies && project.technologies.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each project.technologies as tech}
										<span
											class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600 transition-colors group-hover:border-gray-300 group-hover:bg-gray-100"
										>
											{tech}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</a>
				</article>
			{/each}
		</div>
	{:else}
		<p class="text-center text-gray-500">No projects yet!</p>
	{/if}
</div>

<style>
	.text-shadow {
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}
</style>
