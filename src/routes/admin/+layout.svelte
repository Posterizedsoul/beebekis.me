<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AdminNav from '$lib/components/admin/AdminNav.svelte';

	let { children } = $props();
	let loading = $state(true);
	let authenticated = $state(false);

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			loading = false;
			authenticated = !!user;

			const isLoginPage = page.url.pathname === '/admin/login';

			if (!user && !isLoginPage) {
				// Redirect to login if accessing protected route without user
				// Store current path as 'continue' query param if needed later
				goto('/admin/login');
			} else if (user && isLoginPage) {
				// Redirect to admin dashboard if already logged in and on login page
				goto('/admin');
			}
		});

		return unsubscribe;
	});
</script>

{#if loading}
	<div class="flex h-screen w-full items-center justify-center bg-gray-50">
		<div class="text-center">
			<svg
				class="mx-auto h-12 w-12 animate-spin text-gray-900"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			<h2 class="mt-4 text-xl font-semibold text-gray-700">Loading...</h2>
		</div>
	</div>
{:else if authenticated && page.url.pathname !== '/admin/login'}
	<div class="min-h-screen bg-[#fafafa] text-gray-900">
		<AdminNav />
		<main class="py-10">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{@render children()}
			</div>
		</main>
	</div>
{:else}
	<!-- Login page or non-authenticated view -->
	{@render children()}
{/if}
