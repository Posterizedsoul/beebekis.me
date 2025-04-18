<script>
	import { Mail, Github, Linkedin, Instagram, Facebook } from 'lucide-svelte';
</script>

<svelte:head>
	<title>About Me</title>
	<meta name="description" content="Learn more about Bibek Bhatta." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-8 md:py-16 text-center">
	<h1 class="text-3xl md:text-4xl font-semibold mb-6 text-gray-800">About Me</h1>

	<section class="mb-8">
		<p class="text-lg text-gray-700 leading-relaxed mb-4">
			Hello! I'm Bibek Bhatta. Welcome to my personal space on the web.
		</p>
		<p class="text-lg text-gray-700 leading-relaxed mb-4">
			This is where I share my thoughts, projects, and memories. I like learning whatever I can get my hands on. Currently, I am a Freshman at Mississippi State University, majoring in Mechanical Engineering. 
		</p>
	</section>

	<section class="mt-12">
		<h2 class="text-2xl font-semibold mb-6 text-gray-700">Connect with Me</h2>
		<div class="flex justify-center items-center space-x-6">
			<a
				href="mailto:beebekismee@gmail.com"
				aria-label="Email"
				class="text-gray-600 hover:text-blue-600 transition-colors duration-200"
			>
				<Mail size={28} />
			</a>
			<a
				href="https://github.com/Posterizedsoul/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub (Posterizedsoul)"
				class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
			>
				<Github size={28} />
			</a>
			<a
				href="https://github.com/beebekisme"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub (beebekisme)"
				class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
			>
				<Github size={28} />
			</a>
			<a
				href="https://www.linkedin.com/in/beebekisme/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="LinkedIn"
				class="text-gray-600 hover:text-blue-700 transition-colors duration-200"
			>
				<Linkedin size={28} />
			</a>
			<a
				href="https://www.instagram.com/beebekisme/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Instagram"
				class="text-gray-600 hover:text-pink-600 transition-colors duration-200"
			>
				<Instagram size={28} />
			</a>
			<a
				href="https://www.facebook.com/BeebekBhatt/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Facebook"
				class="text-gray-600 hover:text-blue-800 transition-colors duration-200"
			>
				<Facebook size={28} />
			</a>
		</div>
	</section>
</div>
