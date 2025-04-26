<script lang="ts">
	import type { PageData } from './$types';
	import type { SvelteComponent } from 'svelte';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import DiaryTimeline from '$lib/components/DiaryTimeline.svelte'; // Import the timeline
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	// Blog post specific data
	const metadata = data.metadata || {
		title: 'Untitled Post',
		date: '',
		excerpt: '',
		featuredImage: '',
		edited: undefined // Ensure edited exists for checks
	};
	// Get the resolved image URL from data
	const resolvedImageUrl = data.resolvedImageUrl;
	// Extract the content component and explicitly type it
	const content: typeof SvelteComponent | undefined = data.content;

	// Construct URLs and descriptions for meta tags
	const baseUrl = PUBLIC_BASE_URL || 'https://www.beebekis.me'; // Use env variable or fallback
	const postUrl = `${baseUrl}${page.url.pathname}`; // Construct full URL for this post
	const postDescription = metadata.excerpt || 'Read this blog post by Bibek Bhatta.'; // Use excerpt or fallback

	// Ensure resolvedImageUrl is absolute
	// The resolvedImageUrl from glob should be the correct root-relative path
	const absoluteImageUrl = resolvedImageUrl
		? `${baseUrl}${resolvedImageUrl}` // Prepend base URL directly
		: `${baseUrl}/b.png`; // Fallback image

	// --- Debugging Logs ---
	console.log(`[Blog Meta Debug] Base URL: ${baseUrl}`);
	console.log(`[Blog Meta Debug] Resolved Image URL (from load): ${resolvedImageUrl}`);
	console.log(`[Blog Meta Debug] Final Absolute Image URL (for meta tags): ${absoluteImageUrl}`);
	// --- End Debugging Logs ---

	// Helper function to format date (copied from old layout)
	function formatDate(dateString: string | undefined): string {
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
	<title>{metadata.title} - Blog</title>
	<meta name="description" content={postDescription} key="description" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" key="og:type" />
	<meta property="og:url" content={postUrl} key="og:url" />
	<meta property="og:title" content={metadata.title} key="og:title" />
	<meta property="og:description" content={postDescription} key="og:description" />
	<meta property="og:image" content={absoluteImageUrl} key="og:image" />
	{#if metadata.date}
		<meta property="article:published_time" content={new Date(metadata.date).toISOString()} key="article:published_time" />
	{/if}
	{#if metadata.edited}
		{@const lastEdited = Array.isArray(metadata.edited) ? metadata.edited[metadata.edited.length - 1] : metadata.edited}
		{#if lastEdited}
			<meta property="article:modified_time" content={new Date(lastEdited).toISOString()} key="article:modified_time" />
		{/if}
	{/if}
	<!-- Add author, tags etc. if available -->

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" key="twitter:card" />
	<meta property="twitter:url" content={postUrl} key="twitter:url" />
	<meta property="twitter:title" content={metadata.title} key="twitter:title" />
	<meta property="twitter:description" content={postDescription} key="twitter:description" />
	<meta property="twitter:image" content={absoluteImageUrl} key="twitter:image" />

	<!-- Link to your canonical URL -->
	<link rel="canonical" href={postUrl} key="canonical" />
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
		{#if content} <!-- Check the local content variable -->
			<!-- Use @render with the local content variable -->
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
