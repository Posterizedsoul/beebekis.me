<script lang="ts">
	import type { PageData } from './$types';
	import type { SvelteComponent } from 'svelte';
	import AdminEditButton from '$lib/components/AdminEditButton.svelte';

	// Use $props() for runes mode
	let { data }: { data: PageData } = $props();

	// Reactive assignment: these will update when `data` changes
	// content -> contentHtml (string)
	let contentHtml: string | undefined = $derived(data.contentHtml);
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
	<!-- Personal diary: kept out of search -->
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<header class="entry-header mb-5 pt-1 text-center md:mb-6">
	<h1 class="!mb-2 text-4xl font-semibold text-gray-900 md:text-4xl">
		{formatDate(metadata.date)}
	</h1>
	<p class="!mt-0 text-xl text-gray-800 md:text-xl">{metadata.title}</p>
	<hr class="mx-auto mt-2 mb-0 border-gray-200" />
</header>

{#if contentHtml}
	<!-- Removed wrapping div and prose classes from article -->
	<!-- The layout now handles max-width and prose styling -->
	<article>
		{@html contentHtml}
	</article>
{:else}
	<p class="text-red-500">Error: Could not load diary entry content.</p>
{/if}

<!-- Edit button for logged-in users -->
<AdminEditButton kind="diary" docId={data.id} label="Edit Entry" />
