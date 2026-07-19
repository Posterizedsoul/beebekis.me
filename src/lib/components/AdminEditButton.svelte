<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isAdminHinted } from '$lib/adminHint';

	type Kind = 'diary' | 'blog' | 'project' | 'memory';

	let { kind, docId, label = 'Edit' }: { kind: Kind; docId: string; label?: string } = $props();

	let isLoggedIn = $state(false);
	let composerOpen = $state(false);
	let Composer = $state<typeof import('$lib/components/EntryComposer.svelte').default | null>(null);

	onMount(() => {
		// Anonymous visitors never load Firebase just to hide this button.
		if (!isAdminHinted()) return;
		let unsub: (() => void) | undefined;
		import('$lib/firebase').then(({ auth }) => {
			unsub = auth.onAuthStateChanged((user: unknown) => {
				isLoggedIn = !!user;
			});
		});
		return () => unsub?.();
	});

	async function openComposer() {
		if (!Composer) {
			Composer = (await import('$lib/components/EntryComposer.svelte')).default;
		}
		composerOpen = true;
	}

	function handleClose() {
		composerOpen = false;
		invalidateAll();
	}
</script>

{#if isLoggedIn}
	<button
		type="button"
		onclick={openComposer}
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
	</button>
{/if}

{#if composerOpen && Composer}
	<Composer {kind} {docId} onClose={handleClose} />
{/if}

<style>
	.admin-edit-btn {
		color: white !important;
		text-decoration: none !important;
	}
	.admin-edit-btn:hover {
		color: white !important;
	}
</style>
