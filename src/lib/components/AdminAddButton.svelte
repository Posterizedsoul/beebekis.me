<script lang="ts">
	import { auth } from '$lib/firebase';
	import { onMount } from 'svelte';

	let { kind, label = 'Add' }: { kind: 'diary' | 'blog' | 'project' | 'memory'; label?: string } =
		$props();

	let isLoggedIn = $state(false);
	let composerOpen = $state(false);
	// Composer (tiptap + firebase editor) is lazy-loaded so it never ships to visitors
	let Composer = $state<typeof import('$lib/components/EntryComposer.svelte').default | null>(null);

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user: unknown) => {
			isLoggedIn = !!user;
		});
		return unsubscribe;
	});

	async function openComposer() {
		if (!Composer) {
			Composer = (await import('$lib/components/EntryComposer.svelte')).default;
		}
		composerOpen = true;
	}
</script>

{#if isLoggedIn}
	<button type="button" onclick={openComposer} class="admin-add-link" title={label}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="8" x2="12" y2="16" />
			<line x1="8" y1="12" x2="16" y2="12" />
		</svg>
		<span>{label}</span>
	</button>
{/if}

{#if composerOpen && Composer}
	<Composer {kind} onClose={() => (composerOpen = false)} />
{/if}

<style>
	.admin-add-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #ffffff;
		text-decoration: none;
		cursor: pointer;
		background: rgba(17, 24, 39, 0.9);
		backdrop-filter: blur(4px);
		border-radius: 9999px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.2s ease;
	}
	.admin-add-link:hover {
		background: rgba(55, 65, 81, 0.95);
		transform: scale(1.05);
	}
</style>
