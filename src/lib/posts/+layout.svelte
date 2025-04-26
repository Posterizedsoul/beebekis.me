<script lang="ts">
	import type { PageData } from './$types'; // Import PageData

	// Access page data which includes metadata and resolved image URL
	let { children, data }: { children: Snippet; data: PageData } = $props();

	// Extract metadata or provide defaults
	const metadata = data.metadata || {
		title: 'Untitled Post',
		date: '',
		excerpt: '',
		featuredImage: '' // Keep original filename potentially for alt text
	};
	// Get the resolved image URL from data
	const resolvedImageUrl = data.resolvedImageUrl;

	function formatDate(dateString: string): string {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('en-US', {
			day: 'numeric', // e.g., 15
			month: 'long', // e.g., April
			year: 'numeric' // e.g., 2025
		});
	}
</script>

<!-- 
  Main container for the post content + metadata.
  Adjusted max-width for potentially wider image display.
-->
<!-- Changed max-w-6xl to max-w-7xl -->
<div class="max-w-7xl mx-auto px-4 py-8 md:py-16">
	<!-- Post Header with Featured Image -->
	<header class="mb-8 relative text-center overflow-hidden rounded-lg">
		<!-- Use resolvedImageUrl if available -->
		{#if resolvedImageUrl}
			<!-- Image Container -->
			<div class="w-full h-64 md:h-96">
				<img
					src={resolvedImageUrl} 
					alt={metadata.title || 'Featured image'}
					class="w-full h-full object-cover"
				/>
				<!-- Gradient Overlay for text readability -->
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
				></div>
			</div>

			<!-- Title and Date Overlay -->
			<div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
				<h1 class="text-3xl md:text-5xl font-semibold mb-2">{metadata.title}</h1>
				{#if metadata.date}
					<p class="text-sm md:text-base opacity-90">Published {formatDate(metadata.date)}</p>
				{/if}
			</div>
		{:else}
			<!-- Fallback Header (no image) -->
			<h1 class="text-3xl md:text-4xl font-semibold mb-2">{metadata.title}</h1>
			{#if metadata.date}
				<p class="text-sm">Published {formatDate(metadata.date)}</p>
			{/if}
		{/if}
	</header>

	<!-- Excerpt/Pull Quote Section -->
	{#if metadata.excerpt}
		<!-- Added max-w-3xl and mx-auto to make it narrower and centered -->
		<blockquote
			class="my-10 md:my-12 text-center text-lg md:text-xl italic border-none p-0 max-w-3xl mx-auto"
		>
			"{metadata.excerpt}"
		</blockquote>
	{/if}

	<!-- Removed prose classes from this article tag -->
	<article>
		{@render children()}
	</article>
</div>

<style>
	/* Optional: Add specific overrides if prose classes aren't enough */
	/* For example, target specific heading margins */
	:global(article h2) {
		margin-top: 2em;
		margin-bottom: 1em;
	}
	:global(article h3) {
		margin-top: 1.8em;
		margin-bottom: 0.8em;
	}
</style>
