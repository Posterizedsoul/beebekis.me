<script lang="ts">
	import { auth } from '$lib/firebase';
	import { onMount } from 'svelte';

	let { href, label = 'Add' }: { href: string; label?: string } = $props();

	let isLoggedIn = $state(false);

	onMount(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const unsubscribe = auth.onAuthStateChanged((user: any) => {
			isLoggedIn = !!user;
		});
		return unsubscribe;
	});
</script>

{#if isLoggedIn}
	<a {href} class="admin-add-link" title={label}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
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
	</a>
{/if}

<style>
	.admin-add-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #f5f5f5;
		text-decoration: none;
		background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
		border-left: 3px solid #eab308;
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.25s ease;
	}
	.admin-add-link:hover {
		color: #ffffff;
		background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
		border-left-color: #facc15;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
		transform: translateY(-2px);
	}
	.admin-add-link:visited {
		color: #f5f5f5;
	}
	.admin-add-link:visited:hover {
		color: #ffffff;
	}
	.admin-add-link svg {
		color: #eab308;
		transition: color 0.25s ease;
	}
	.admin-add-link:hover svg {
		color: #facc15;
	}
</style>
