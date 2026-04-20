<script lang="ts">
	import { page } from '$app/state';
	import { auth } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';

	let isOpen = $state(false);

	function toggleMenu() {
		isOpen = !isOpen;
	}

	async function handleLogout() {
		try {
			await signOut(auth);
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

<nav class="bg-white shadow">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between">
			<div class="flex">
				<div class="flex flex-shrink-0 items-center">
					<a href="/admin" class="text-xl font-bold text-gray-800">Admin</a>
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
					<a
						href="/admin"
						class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 {isActive(
							'/admin'
						) && !isActive('/admin/')
							? '!border-black !text-gray-900'
							: ''}"
					>
						Dashboard
					</a>
					<a
						href="/admin/memories"
						class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 {isActive(
							'/admin/memories'
						)
							? '!border-black !text-gray-900'
							: ''}"
					>
						Memories
					</a>
					<a
						href="/admin/diary"
						class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 {isActive(
							'/admin/diary'
						)
							? '!border-black !text-gray-900'
							: ''}"
					>
						Diary
					</a>
					<a
						href="/admin/blog"
						class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 {isActive(
							'/admin/blog'
						)
							? '!border-black !text-gray-900'
							: ''}"
					>
						Blog
					</a>
					<a
						href="/admin/projects"
						class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 {isActive(
							'/admin/projects'
						)
							? '!border-black !text-gray-900'
							: ''}"
					>
						Projects
					</a>
				</div>
			</div>
			<div class="hidden sm:ml-6 sm:flex sm:items-center">
				<button
					onclick={handleLogout}
					class="block rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
				>
					Sign Out
				</button>
			</div>
			<div class="-mr-2 flex items-center sm:hidden">
				<button
					type="button"
					onclick={toggleMenu}
					class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset"
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

	<div class="sm:hidden" id="mobile-menu" class:hidden={!isOpen}>
		<div class="space-y-1 pt-2 pb-3">
			<a
				href="/admin"
				class="block border-l-4 border-transparent bg-gray-50 py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 {isActive(
					'/admin'
				) && !isActive('/admin/')
					? '!border-black !bg-gray-100 !text-gray-900'
					: ''}"
			>
				Dashboard
			</a>
			<a
				href="/admin/memories"
				class="block border-l-4 border-transparent bg-gray-50 py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 {isActive(
					'/admin/memories'
				)
					? '!border-black !bg-gray-100 !text-gray-900'
					: ''}"
			>
				Memories
			</a>
			<a
				href="/admin/diary"
				class="block border-l-4 border-transparent bg-gray-50 py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 {isActive(
					'/admin/diary'
				)
					? '!border-black !bg-gray-100 !text-gray-900'
					: ''}"
			>
				Diary
			</a>
			<a
				href="/admin/blog"
				class="block border-l-4 border-transparent bg-gray-50 py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 {isActive(
					'/admin/blog'
				)
					? '!border-black !bg-gray-100 !text-gray-900'
					: ''}"
			>
				Blog
			</a>
			<a
				href="/admin/projects"
				class="block border-l-4 border-transparent bg-gray-50 py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 {isActive(
					'/admin/projects'
				)
					? '!border-black !bg-gray-100 !text-gray-900'
					: ''}"
			>
				Projects
			</a>
			<button
				onclick={handleLogout}
				class="block w-full border-l-4 border-transparent bg-gray-50 py-2 pr-4 pl-3 text-left text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
			>
				Sign Out
			</button>
		</div>
	</div>
</nav>
