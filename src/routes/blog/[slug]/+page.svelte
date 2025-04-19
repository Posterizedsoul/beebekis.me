<script lang="ts">
	import type { PageData } from './$types';
	import BackToTop from '$lib/components/BackToTop.svelte'; // Import the new component

	// Get all loaded data using $props()
	const { data } = $props<{ data: PageData }>();
	const { content, metadata, resolvedImageUrl } = data;

	// Helper function to format date (copied from old layout)
	function formatDate(dateString: string): string {
		if (!dateString) return '';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			});
		} catch (e) {
			console.error('Invalid date format:', dateString);
			return 'Invalid Date';
		}
	}

	// No longer need getLatestEditDate or derived values for it

</script>

<svelte:head>
	<title>{metadata.title || 'Blog Post'}</title>
	{#if metadata.excerpt}
		<meta name="description" content={metadata.excerpt} />
	{/if}
	<!-- Add other meta tags like Open Graph if needed -->
</svelte:head>

<!-- Post Header - Moved outside the max-width container -->
<header class="relative text-center overflow-hidden">
	{#if resolvedImageUrl}
		<!-- Header with Image -->
		<!-- Removed rounded-lg from header, apply to image container if needed -->
		<div class="w-full h-64 md:h-96">
			<img
				src={resolvedImageUrl}
				alt={metadata.title || 'Featured image'}
				class="w-full h-full object-cover"
				loading="eager"
			/>
			<!-- Load header image eagerly -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
		</div>
		<div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
			<h1 class="text-3xl md:text-5xl font-semibold mb-2 text-shadow">{metadata.title}</h1>
			{#if metadata.date}
				<p class="text-sm md:text-base opacity-90 text-shadow mb-0">
					{formatDate(metadata.date)}
				</p>
			{/if}
			{#if metadata.edited}
				{#if Array.isArray(metadata.edited)}
					{#if metadata.edited.length > 0}
						<div class="text-sm md:text-base opacity-80 text-shadow mt-1">
							<span class="">🛈 Edited:</span>
							<ul class="list-none p-0 m-0 inline-block ml-1">
								{#each metadata.edited as editDate, i (editDate)}
									<li class="inline">{formatDate(editDate)} {#if i < metadata.edited.length - 1} |{/if}</li>
								{/each}
							</ul>
						</div>
					{/if}
				{:else}
					<p class="text-sm md:text-base opacity-80 text-shadow mt-1">
						<span class="">🛈 edited {formatDate(metadata.edited)}</span>
					</p>
				{/if}
			{/if}
		</div>
	{:else}
		<!-- Fallback Header (no image) - Needs padding if it's the first element -->
		<div class="max-w-6xl mx-auto px-4 pt-8 md:pt-16">
			<h1 class="text-3xl md:text-4xl font-semibold mb-2">{metadata.title}</h1>
			{#if metadata.date}
				<p class="text-sm text-gray-600 mb-0">
					{formatDate(metadata.date)}
				</p>
			{/if}
			{#if metadata.edited}
				{#if Array.isArray(metadata.edited)}
					{#if metadata.edited.length > 0}
						<div class="text-sm text-gray-500 mt-1 italic">
							<span class="">🛈 Edited:</span>
							<ul class="list-none p-0 m-0 inline-block ml-1">
								{#each metadata.edited as editDate, i (editDate)}
									<li class="inline">{formatDate(editDate)} {#if i < metadata.edited.length - 1} - {/if}</li>
								{/each}
							</ul>
						</div>
					{/if}
				{:else}
					<p class="text-sm text-gray-500 mt-1">
						<span class="italic">🛈 edited {formatDate(metadata.edited)}</span>
					</p>
				{/if}
			{/if}
		</div>
	{/if}
</header>

<!-- Main content container - Removed top padding, added margin-top -->
<div class="max-w-6xl mx-auto px-4 pb-8 md:pb-16 mt-8 md:mt-12">
	<!-- Excerpt (from old layout) -->
	{#if metadata.excerpt}
		<blockquote class="my-10 md:my-12 text-center text-lg md:text-xl italic text-gray-600 border-none p-0 max-w-3xl mx-auto">
			"{metadata.excerpt}"
		</blockquote>
	{/if}

	<!-- Article Content (wrapper from old layout, rendering from old page) -->
	<article class="prose prose-neutral lg:prose-lg max-w-none text-justify prose-a:text-blue-600 hover:prose-a:text-blue-800">
		{#if content}
			<!-- Use @render for dynamic components in Svelte 5 -->
			{@render content()}
		{:else}
			<p>Error loading post content.</p>
		{/if}
	</article>
</div>

<!-- Use the BackToTop component -->
<BackToTop />

<style>
	/* Styles from old layout */
	:global(article h2) { margin-top: 2em; margin-bottom: 1em; }
	:global(article h3) { margin-top: 1.8em; margin-bottom: 0.8em; }
	/* Add text-shadow utility if not globally available */
	.text-shadow { text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
</style>
