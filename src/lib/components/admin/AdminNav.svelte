<script lang="ts">
	import { page } from '$app/state';
	import { auth } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { setAdminHint } from '$lib/adminHint';

	let isOpen = $state(false);

	const links = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/memories', label: 'Memories' },
		{ href: '/admin/diary', label: 'Diary' },
		{ href: '/admin/blog', label: 'Blog' },
		{ href: '/admin/projects', label: 'Projects' }
	];

	function toggleMenu() {
		isOpen = !isOpen;
	}

	async function handleLogout() {
		try {
			await signOut(auth);
			setAdminHint(false);
			goto('/admin/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}

	// Helper to check active state
	function isActive(path: string) {
		if (path === '/admin') {
			return page.url.pathname === '/admin';
		}
		return page.url.pathname.startsWith(path);
	}
</script>

<nav class="border-b border-gray-200 bg-white">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center gap-6">
				<!-- Logo: back to the main website -->
				<a href="/" class="flex flex-shrink-0 items-center gap-3" title="Back to website">
					<img src="/b.png" alt="Bibek Bhatta" class="h-9 w-9 rounded-full object-cover" />
					<span class="font-serif text-lg font-bold tracking-widest text-black uppercase"
						>Admin</span
					>
				</a>
				<div class="hidden sm:flex sm:items-center sm:space-x-5 md:space-x-7">
					{#each links as link (link.href)}
						<a
							href={link.href}
							class="group relative text-sm transition-colors duration-300 {isActive(link.href)
								? 'text-black'
								: 'text-gray-600 hover:text-black'}"
						>
							<span>{link.label}</span>
							<span
								class="absolute bottom-0 left-0 block h-0.5 w-full origin-left transform bg-black transition-transform duration-300 ease-out {isActive(
									link.href
								)
									? 'scale-x-100'
									: 'scale-x-0 group-hover:scale-x-100'}"
							></span>
						</a>
					{/each}
				</div>
			</div>
			<div class="hidden sm:flex sm:items-center sm:gap-3">
				<a
					href="/"
					class="text-sm text-gray-600 transition-colors duration-300 hover:text-black"
					title="View the public site"
				>
					View Site ↗
				</a>
				<button
					onclick={handleLogout}
					class="rounded-sm border border-black bg-white px-4 py-1.5 font-serif text-xs font-medium tracking-wider text-black uppercase transition-colors hover:bg-gray-100"
				>
					Sign Out
				</button>
			</div>
			<div class="-mr-2 flex items-center sm:hidden">
				<button
					type="button"
					onclick={toggleMenu}
					class="inline-flex items-center justify-center rounded-sm p-2 text-gray-500 hover:bg-gray-100 hover:text-black focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset"
					aria-controls="mobile-menu"
					aria-expanded={isOpen}
				>
					<span class="sr-only">Open main menu</span>
					{#if isOpen}
						<svg
							class="block h-6 w-6"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{:else}
						<svg
							class="block h-6 w-6"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<div class="border-t border-gray-100 sm:hidden" id="mobile-menu" class:hidden={!isOpen}>
		<div class="space-y-1 pt-2 pb-3">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="block border-l-4 py-2 pr-4 pl-3 text-base font-medium {isActive(link.href)
						? 'border-black bg-gray-100 text-black'
						: 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-black'}"
				>
					{link.label}
				</a>
			{/each}
			<a
				href="/"
				class="block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-black"
			>
				View Site ↗
			</a>
			<button
				onclick={handleLogout}
				class="block w-full border-l-4 border-transparent py-2 pr-4 pl-3 text-left text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-black"
			>
				Sign Out
			</button>
		</div>
	</div>
</nav>
