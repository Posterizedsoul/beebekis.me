<script lang="ts">
	import type { PageData } from './$types';
	import type { SvelteComponent } from 'svelte';

	// Use $props() for runes mode
	let { data }: { data: PageData } = $props();

	// Reactive assignment: these will update when `data` changes
	let content: typeof SvelteComponent | undefined = $derived(data.content);
	let metadata = $derived(data.metadata || { title: 'Untitled Entry', date: '' });

	function formatDate(dateString: string): string {
		if (!dateString) return '';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch (e) {
			return 'Invalid Date';
		}
	}
</script>

<svelte:head>
	<title>{metadata.title} - Diary</title>
	{#if metadata.description}
		<meta name="description" content={metadata.description} />
	{/if}
</svelte:head>

<header class="entry-header text-center mb-5 md:mb-6 pt-1">
	<h1 class="text-4xl md:text-4xl font-semibold !mb-2 text-gray-900">{formatDate(metadata.date)}</h1>
	<p class="text-xl md:text-xl text-gray-800 !mt-0">{metadata.title}</p>
	<hr class="mx-auto mt-2 mb-0 border-gray-200" />
</header>

{#if content}
	<!-- Removed wrapping div and prose classes from article -->
	<!-- The layout now handles max-width and prose styling -->
	<article>
		{@render content()}
	</article>
{:else}
	<p class="text-red-500">Error: Could not load diary entry content.</p>
{/if}
