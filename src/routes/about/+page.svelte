<script>
	// Icons are needed again
	import { Mail, Github, Linkedin, Instagram, Facebook } from 'lucide-svelte';
</script>

<svelte:head>
	<title>About Me</title>
	<meta name="description" content="Learn more about Bibek Bhatta." />
</svelte:head>

<!-- Main container with grid background - Ensure justify-center -->
<div
	class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-12 py-16 md:py-24 bg-gray-100 text-black relative grid-bg"
>
	<!-- Large Stacked Text -->
	<div class="z-10">
		<!-- Use a bold serif font, very large size, tight leading -->
		<h1 class="font-serif font-bold text-6xl sm:text-8xl md:text-9xl lg:text-[9rem] xl:text-[10rem] leading-none uppercase">
			MECHANICAL
		</h1>
		<h1 class="font-serif font-bold text-6xl sm:text-8xl md:text-9xl lg:text-[9rem] xl:text-[10rem] leading-none uppercase">
			ENGINEER
		</h1>
		
		<p class="font-serif text-base sm:text-lg md:text-xl font-medium max-w-xl text-gray-700 mt-4">
			I mostly break things... but sometimes they work.	
		</p>

		<!-- Social Links Container - Restored here -->
		<div class="social-links mt-8 flex space-x-5">
			<a
				href="mailto:beebekismee@gmail.com"
				aria-label="Email"
				class="icon-link text-black hover:opacity-75"
			>
				<Mail size={24} />
			</a>
			<a
				href="https://github.com/Posterizedsoul/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub (Posterizedsoul)"
				class="icon-link text-black hover:opacity-75"
			>
				<Github size={24} />
			</a>
			<a
				href="https://github.com/beebekisme"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub (beebekisme)"
				class="icon-link text-black hover:opacity-75"
			>
				<Github size={24} />
			</a>
			<a
				href="https://www.linkedin.com/in/beebekisme/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="LinkedIn"
				class="icon-link text-black hover:opacity-75"
			>
				<Linkedin size={24} />
			</a>
			<a
				href="https://www.instagram.com/beebekisme/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Instagram"
				class="icon-link text-black hover:opacity-75"
			>
				<Instagram size={24} />
			</a>
			<a
				href="https://www.facebook.com/BeebekBhatt/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Facebook"
				class="icon-link text-black hover:opacity-75"
			>
				<Facebook size={24} />
			</a>
		</div>
	</div>
</div>

<style>
	/* Grid Background */
	.grid-bg {
		/* Adjust grid color and size as needed */
		/* Use CSS variables */
		--grid-color: var(--tw-color-gray-300); 
		--grid-size: 40px; /* Size of the grid squares */
		/* Use CSS variable */
		background-color: var(--tw-color-gray-100); /* Base background */
		background-image:
			linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
			linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
		background-size: var(--grid-size) var(--grid-size);
	}

	/* Style for social icons - Restored */
	.icon-link {
		transition: opacity 0.2s ease-in-out; 
	}
</style>
