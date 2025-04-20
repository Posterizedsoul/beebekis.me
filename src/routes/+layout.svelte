<script lang="ts">
	import '../app.css';
	import { page } from '$app/state'; // Import page from $app/state
	import { PUBLIC_BASE_URL } from '$env/static/public';

	let { children } = $props();

	// Reactive check: true if the current path is the homepage '/'
	const isHomePage = $derived(page.url.pathname === '/');

	// Site metadata (adjust as needed)
	const siteTitle = 'Bibek Bhatta - Portfolio';
	const siteDescription = 'Personal portfolio, blog, and memories of Bibek Bhatta.';
	const siteUrl = PUBLIC_BASE_URL || 'https://your-default-domain.com'; // Fallback domain
	const defaultImageUrl = `${siteUrl}/b.png`; // Assumes b.png is in static folder

	// Restore $effect for scroll lock, remove background class logic
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

<!-- Wrapper for foreground content (Navbar + Main). I hate frontend, won't touch this shit again-->
<div class="relative z-0 bg-white">
	<!-- Navbar -->
	<nav
		class="p-2 flex justify-center fixed bottom-0 left-0 right-0 bg-white shadow-md z-10 md:relative md:bottom-auto md:left-auto md:right-auto md:bg-transparent md:shadow-none md:p-4"
	>
		<ul class="flex flex-row space-x-2 md:space-x-4 items-center">
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
					href="/blog"
					class="relative group transition-colors duration-300 text-sm md:text-base {page.url.pathname === '/blog' ? 'text-black' : 'hover:text-black'}"
				>
					<span>Blog</span>
					<span
						class="absolute bottom-0 left-0 block h-0.5 bg-black w-full transform transition-transform duration-300 ease-out origin-left {page.url.pathname === '/blog' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}"
					></span>
				</a>
			</li>
			<li>
				<a
					href="/memories"
					class="relative group transition-colors duration-300 text-sm md:text-base {page.url.pathname === '/memories' ? 'text-black' : 'hover:text-black'}"
				>
					<span>Memories</span>
					<span
						class="absolute bottom-0 left-0 block h-0.5 bg-black w-full transform transition-transform duration-300 ease-out origin-left {page.url.pathname === '/memories' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}"
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

	<!-- Main content area - Removed conditional classes -->
	<main class="p-4 pb-16 md:pb-4 relative z-0">
		{@render children()}
	</main>
</div>
