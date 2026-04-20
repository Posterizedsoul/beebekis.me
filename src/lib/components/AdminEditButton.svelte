<script lang="ts">
	import { auth } from '$lib/firebase';
	import { onMount } from 'svelte';

	let { href, label = 'Edit' }: { href: string; label?: string } = $props();

	let isLoggedIn = $state(false);

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			isLoggedIn = !!user;
		});
		return unsubscribe;
	});
</script>

{#if isLoggedIn}
	<a
		{href}
		class="admin-edit-btn fixed right-4 bottom-20 z-50 flex items-center gap-2 rounded-full bg-gray-900/90 px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-gray-700"
		title={label}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
			<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
		</svg>
		<span class="hidden sm:inline">{label}</span>
	</a>
{/if}

<style>
	.admin-edit-btn {
		color: white !important;
		text-decoration: none !important;
	}
	.admin-edit-btn:hover,
	.admin-edit-btn:visited {
		color: white !important;
	}
</style>
