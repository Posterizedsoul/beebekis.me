<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import { onMount, onDestroy } from 'svelte'; // Import onMount and onDestroy
	import { browser } from '$app/environment'; // Import browser check

	let { children } = $props();

	// Reactive check: true if the current path is the homepage '/'
	const isHomePage = $derived(page.url.pathname === '/');

	// Site metadata (adjust as needed)
	const siteTitle = 'Bibek Bhatta - Portfolio';
	const siteDescription = 'Personal portfolio, blog, and memories of Bibek Bhatta.';
	const siteUrl = PUBLIC_BASE_URL || 'https://your-default-domain.com'; // Fallback domain
	const defaultImageUrl = `${siteUrl}/b.png`; // Assumes b.png is in static folder

	// State for navbar visibility - Use $state
	let lastScrollY = $state(0);
	let navbarVisible = $state(true);
	const threshold = 50; // Pixels to scroll before hiding

	function handleScroll() {
		if (!browser) return;
		const currentScrollY = window.scrollY;

		if (currentScrollY <= threshold) {
			// Always show near the top
			navbarVisible = true;
		} else if (currentScrollY > lastScrollY) {
			// Scrolling down
			navbarVisible = false;
		} else {
			// Scrolling up
			navbarVisible = true;
		}
		// Update last scroll position, but prevent negative values on bounce
		lastScrollY = Math.max(0, currentScrollY); 
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', handleScroll, { passive: true });
			lastScrollY = window.scrollY; // Initialize
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('scroll', handleScroll);
		}
	});

	// Restore $effect for scroll lock on homepage
	$effect(() => {
		if (isHomePage) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}

		// Optional cleanup function
		return () => {
			// Reset overflow when component unmounts
			document.body.style.overflow = 'auto';
		};
	});
</script>

<svelte:head>
	<!-- Standard Meta Tags -->
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${siteUrl}${page.url.pathname}`} />
	<meta property="og:title" content={siteTitle} />
	<meta property="og:description" content={siteDescription} />
	<meta property="og:image" content={defaultImageUrl} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={`${siteUrl}${page.url.pathname}`} />
	<meta property="twitter:title" content={siteTitle} />
	<meta property="twitter:description" content={siteDescription} />
	<meta property="twitter:image" content={defaultImageUrl} />

	<!-- Link to your canonical URL -->
	<link rel="canonical" href={`${siteUrl}${page.url.pathname}`} />
</svelte:head>

<!-- Background for homepage -->
{#if isHomePage}
	<div class="fixed inset-0 -z-10 overflow-hidden">
		<img
			src="/background.png"
			alt="Background"
			class="absolute inset-0 h-full w-full object-contain origin-center scale-90"
		/>
	</div>
{/if}

<!-- Wrapper for foreground content (Navbar + Main). -->
<div class="relative z-0 bg-white min-h-screen">
	<!-- Navbar -->
	<nav
		class="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 bg-white transition-transform duration-300 ease-in-out {navbarVisible ? 'translate-y-0' : '-translate-y-full'}"
	>
		<ul class="flex flex-row space-x-4 items-center text-gray-600">
			<li>
				<a
					href="/"
					class="relative group transition-colors duration-300 text-sm md:text-base {page.url.pathname === '/' ? 'text-black' : 'hover:text-black'}"
				>
					<span>Home</span>
					<span
						class="absolute bottom-0 left-0 block h-0.5 bg-black w-full transform transition-transform duration-300 ease-out origin-left {page.url.pathname === '/' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}"
					></span>
				</a>
			</li>
			
			<li>
				<a
					href="/diary"
					class="relative group transition-colors duration-300 text-sm md:text-base {page.url.pathname.startsWith('/diary') ? 'text-black' : 'hover:text-black'}"
				>
					<span>Diary</span>
					<span
						class="absolute bottom-0 left-0 block h-0.5 bg-black w-full transform transition-transform duration-300 ease-out origin-left {page.url.pathname.startsWith('/diary') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}"
					></span>
				</a>
			</li>
			<li>
				<a
					href="/blog"
					class="relative group transition-colors duration-300 text-sm md:text-base {page.url.pathname.startsWith('/blog') ? 'text-black' : 'hover:text-black'}"
				>
					<span>Blog</span>
					<span
						class="absolute bottom-0 left-0 block h-0.5 bg-black w-full transform transition-transform duration-300 ease-out origin-left {page.url.pathname.startsWith('/blog') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}"
					></span>
				</a>
			</li>
			<li>
				<a
					href="/memories"
					class="relative group transition-colors duration-300 text-sm md:text-base {page.url.pathname.startsWith('/memories') ? 'text-black' : 'hover:text-black'}"
				>
					<span>Memories</span>
					<span
						class="absolute bottom-0 left-0 block h-0.5 bg-black w-full transform transition-transform duration-300 ease-out origin-left {page.url.pathname.startsWith('/memories') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}"
					></span>
				</a>
			</li>
			<li>
				<a
					href="/about"
					class="relative group transition-colors duration-300 text-sm md:text-base {page.url.pathname === '/about' ? 'text-black' : 'hover:text-black'}"
				>
					<span>About</span>
					<span
						class="absolute bottom-0 left-0 block h-0.5 bg-black w-full transform transition-transform duration-300 ease-out origin-left {page.url.pathname === '/about' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}"
					></span>
				</a>
			</li>
		</ul>
	</nav>

	<!-- Main content area - Added pt-16 for navbar offset -->
	<main class="pt-16 text-gray-800">
		{@render children()}
	</main>
</div>
