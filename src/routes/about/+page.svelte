<script>
	// Icons are needed again
	import {
		Mail,
		Github,
		Linkedin,
		Instagram,
		Facebook,
		Phone,
		MapPin,
		ChevronDown,
		ArrowUp
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	function scrollToElement(elementId) {
		const element = document.getElementById(elementId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function viewResume() {
		scrollToElement('resume-section'); // Scroll to the top of the resume section
	}

	function viewAbout() {
		scrollToElement('about-section-top'); // Scroll to the top of the about section
	}

	let showBackToTop = false;
	let resumeSectionTop = 0;

	function handleScroll() {
		if (resumeSectionTop > 0) {
			showBackToTop = window.scrollY > resumeSectionTop;
		}
	}

	onMount(() => {
		const resumeSection = document.getElementById('resume-section');
		if (resumeSection) {
			resumeSectionTop = resumeSection.offsetTop;
		}
	});
</script>

<svelte:head>
	<title>About Me - Bibek Bhatta</title>
	<meta name="description" content="Learn more about Bibek Bhatta, a Mechanical Engineer." />
</svelte:head>

<svelte:window on:scroll={handleScroll} />

<!-- About Section -->
<div
	id="about-section-top"
	class="grid-bg relative flex min-h-screen items-center justify-center bg-gray-100 px-4 py-16 text-black sm:px-6 md:py-24 lg:px-12"
>
	<!-- Large Stacked Text -->
	<div class="z-10 text-center">
		<!-- Centered the content here -->
		<h1
			class="font-serif text-5xl font-bold uppercase leading-none sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem]"
		>
			MECHANICAL
		</h1>
		<h1
			class="font-serif text-5xl font-bold uppercase leading-none sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem]"
		>
			ENGINEER
		</h1>

		<p
			class="mx-auto mt-4 max-w-xl font-serif text-base font-medium text-gray-700 sm:text-lg md:text-xl"
		>
			<!-- mx-auto for centering -->
			I mostly break things... but sometimes they work.
		</p>

		<!-- Social Links Container -->
		<div class="social-links mt-8 flex justify-center space-x-5">
			<!-- justify-center for centering -->
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

		<!-- Resume Button -->
		<div class="mt-12 flex justify-center">
			<button
				on:click={viewResume}
				class="flex items-center justify-center gap-2 rounded-sm bg-black px-8 py-3 font-serif text-lg font-medium uppercase tracking-wider text-white shadow-md transition-colors duration-200 hover:bg-gray-800"
			>
				View My Resume
				<ChevronDown size={24} />
			</button>
		</div>
	</div>
</div>

<!-- Resume Section -->
<section id="resume-section" class="min-h-screen bg-white px-4 py-16 sm:px-6 md:py-24 lg:px-12">
	<div class="mx-auto max-w-4xl text-left">
		<div class="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
			<h2
				class="text-center font-serif text-4xl font-bold uppercase text-black sm:text-left sm:text-5xl md:text-6xl"
			>
				Bibek Bhatta
			</h2>
			<div class="flex flex-col gap-4 sm:flex-row">
				<button
					on:click={viewAbout}
					class="order-2 w-full rounded-sm border border-black bg-white px-6 py-3 font-serif text-base font-medium uppercase tracking-wider text-black shadow-md transition-colors duration-200 hover:bg-gray-100 sm:order-1 sm:w-auto"
				>
					Back to About
				</button>
				<a
					href="/BIBEK_BHATTA_LATEST_RESUME.pdf"
					download="BIBEK_BHATTA_RESUME.pdf"
					class="order-1 w-full rounded-sm bg-black px-6 py-3 text-center font-serif text-base font-medium uppercase tracking-wider text-white shadow-md transition-colors duration-200 hover:bg-gray-800 sm:order-2 sm:w-auto"
				>
					Download PDF
				</a>
			</div>
		</div>

		<div class="mb-8 text-center font-serif text-sm text-gray-700">
			<div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:gap-x-3">
				<a href="mailto:bb3017@msstate.edu" class="flex items-center text-blue-600 hover:underline">
					<Mail size={16} class="mr-1.5" />
					bb3017@msstate.edu
				</a>
				<span class="hidden text-gray-400 sm:inline">|</span>
				<span class="flex items-center">
					<Phone size={16} class="mr-1.5" />
					+1 571-602-3140
				</span>
				<span class="hidden text-gray-400 sm:inline">|</span>
				<a
					href="https://www.linkedin.com/in/beebekisme/"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center text-blue-600 hover:underline"
				>
					<Linkedin size={16} class="mr-1.5" />
					linkedin.com/in/beebekisme
				</a>
				<span class="hidden text-gray-400 sm:inline">|</span>
				<a
					href="https://github.com/Posterizedsoul"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center text-blue-600 hover:underline"
				>
					<Github size={16} class="mr-1.5" />
					github.com/Posterizedsoul
				</a>
			</div>
		</div>

		<div class="space-y-6">
			<!-- Summary Section -->
			<div>
				<h3
					class="mb-2 border-b border-black pb-1 font-serif text-lg font-bold uppercase text-black"
				>
					Summary
				</h3>
				<p class="pt-1 font-serif text-sm text-gray-800">
					Results-driven <strong>Python</strong> Developer with over 5 years of experience in
					<strong>3-D Printing</strong>, <strong>Electronics</strong>,
					<strong>REST API</strong> development, <strong>Machine Learning</strong>,
					<strong>Computer Vision</strong>, and <strong>Data Analytics</strong>. Proficient in
					building robust applications with <strong>FastAPI</strong> and leveraging libraries such
					as
					<strong>PyTorch</strong>, <strong>Pandas</strong>, <strong>Matplotlib</strong>,
					<strong>OpenCV</strong>, and <strong>NumPy</strong>. Passionate about
					<strong>Machine Learning</strong> and possess a proven track record of contributing to
					<strong>Open-Source</strong>
					projects. Skilled in leveraging a strong foundation in <strong>mathematics</strong> to
					solve complex analytical problems. Highly interested in <strong>aerodynamics</strong>,
					<strong>design</strong> and <strong>control systems</strong> of
					<strong>Unmanned Aerial Vehicle Systems</strong>.
				</p>
			</div>

			<!-- Education Section -->
			<div>
				<h3
					class="mb-2 border-b border-black pb-1 font-serif text-lg font-bold uppercase text-black"
				>
					Education
				</h3>
				<div class="pt-1">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
						<h4 class="font-serif text-lg font-bold text-black">
							Bachelor of Science in Mechanical Engineering
						</h4>
						<p class="flex-shrink-0 pt-1 font-serif text-sm font-bold text-black sm:pl-4 sm:pt-0">
							December 2028
						</p>
					</div>
					<p class="font-serif text-sm text-gray-800">
						Mississippi State University • Starkville, Mississippi • Freshman
					</p>
					<ul class="ml-4 list-outside list-disc pt-1 font-serif text-sm text-gray-800">
						<li>Cumulative GPA: <strong>4.0/4.0</strong></li>
						<li>Colvard Future Leader Scholarship | Freshman Academic Excellence Scholarship.</li>
					</ul>
				</div>
				<div class="mt-2">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
						<h4 class="font-serif text-lg font-bold text-black">
							Cambridge International Advanced Levels
						</h4>
						<p class="flex-shrink-0 pt-1 font-serif text-sm font-bold text-black sm:pl-4 sm:pt-0">
							August 2023
						</p>
					</div>
					<p class="font-serif text-sm text-gray-800">
						St. Xavier's College • Maitighar, Kathmandu
					</p>
					<ul class="ml-4 list-outside list-disc pt-1 font-serif text-sm text-gray-800">
						<li>
							Bronze Honor International Youth Math Challenge | Bronze National Science Exhibition |
							Bronze Budanilkantha National Math League | Gold Provincial Information Technology
							Olympiad | Silver National Information Technology Olympiad
						</li>
					</ul>
				</div>
			</div>

			<!-- Experience Section -->
			<div>
				<h3
					class="mb-2 border-b border-black pb-1 font-serif text-lg font-bold uppercase text-black"
				>
					Experience
				</h3>
				<div class="pt-1">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
						<h4 class="font-serif text-lg font-bold text-black">Technical Lead</h4>
						<p class="flex-shrink-0 pt-1 font-serif text-sm font-bold text-black sm:pl-4 sm:pt-0">
							June 2021 - Present
						</p>
					</div>
					<p class="font-serif text-sm text-gray-800">
						Mathematical Association of Nepal / Kathmandu, Nepal
					</p>
					<ul class="ml-4 list-outside list-disc space-y-1 pt-1 font-serif text-sm text-gray-800">
						<li>
							Develop comprehensive registration and training software using <strong>Python</strong
							>,
							<strong>FastAPI</strong>,
							<strong>DaisyUI</strong> and <strong>SvelteKit</strong>, significantly enhancing user
							experience and operational efficiency.
						</li>
						<li>
							Engineer a training application with <strong>Python</strong> and
							<strong>DearPyGUI</strong> supported by a <strong>FastAPI</strong>
							backend, to improve the training processes.
						</li>
						<li>
							Create a custom <strong>PDF-to-image generator</strong> for
							<strong>LaTeX</strong> processing and design a specialized
							<strong>MongoDB</strong> database for mathematical problems.
						</li>
					</ul>
				</div>
				<div class="mt-2">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
						<h4 class="font-serif text-lg font-bold text-black">
							Backend Engineer and Machine Learning Developer
						</h4>
						<p class="flex-shrink-0 pt-1 font-serif text-sm font-bold text-black sm:pl-4 sm:pt-0">
							August 2024 - June 2025
						</p>
					</div>
					<p class="font-serif text-sm text-gray-800">usjany / Kathmandu, Nepal</p>
					<ul class="ml-4 list-outside list-disc space-y-1 pt-1 font-serif text-sm text-gray-800">
						<li>
							Developed a production-level backend server using <strong>FastAPI</strong> with
							<strong>Python</strong> libraries including <strong>BeautifulSoup</strong> and
							<strong>Requests</strong>, and a <strong>PostgreSQL</strong> database.
						</li>
						<li>
							Built and fine-tuned a custom <strong>Large Language Model</strong> powered by
							<strong>Meta AI's Llama-3.1 8B</strong>, implementing a
							<strong>Retrieval-Augmented Generation (RAG)</strong> pipeline to enhance response accuracy.
						</li>
					</ul>
				</div>
				<div class="mt-2">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
						<h4 class="font-serif text-lg font-bold text-black">Machine Learning Developer</h4>
						<p class="flex-shrink-0 pt-1 font-serif text-sm font-bold text-black sm:pl-4 sm:pt-0">
							February 2023 - June 2023
						</p>
					</div>
					<p class="font-serif text-sm text-gray-800">Agrisense / Kathmandu, Nepal</p>
					<ul class="ml-4 list-outside list-disc space-y-1 pt-1 font-serif text-sm text-gray-800">
						<li>
							Developed and implemented a custom <strong>CNN-based image processing model</strong>
							utilizing
							<strong>Scikit-learn</strong>, <strong>NumPy</strong>, and
							<strong>OpenCV</strong> for plant disease detection to enhance agricultural diagnostics.
						</li>
						<li>
							I modelled a sanctuary, for presentation, in <strong>Free CAD</strong> and
							<strong>3D-printed</strong> it in <strong>PLA</strong>, optimizing the design for
							<strong>FDM printing</strong> with proper wall thickness, layer height, and minimal supports.
						</li>
					</ul>
				</div>
				<div class="mt-2">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
						<h4 class="font-serif text-lg font-bold text-black">Machine Learning Developer</h4>
						<p class="flex-shrink-0 pt-1 font-serif text-sm font-bold text-black sm:pl-4 sm:pt-0">
							December 2022 - May 2023
						</p>
					</div>
					<p class="font-serif text-sm text-gray-800">Traverse / Kathmandu, Bagmati</p>
					<ul class="ml-4 list-outside list-disc space-y-1 pt-1 font-serif text-sm text-gray-800">
						<li>
							Engineered a custom <strong>recommendation engine</strong> using
							<strong>NumPy</strong> and <strong>PyTorch</strong> to suggest places based on user itineraries,
							enhancing user personalization and engagement.
						</li>
					</ul>
				</div>
				<div class="mt-2">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
						<h4 class="font-serif text-lg font-bold text-black">Project Lead / Lead Developer</h4>
						<p class="flex-shrink-0 pt-1 font-serif text-sm font-bold text-black sm:pl-4 sm:pt-0">
							October 2022 - November 2022
						</p>
					</div>
					<p class="font-serif text-sm text-gray-800">
						NASA Space Apps Challenge / Kathmandu, Bagmati
					</p>
					<ul class="ml-4 list-outside list-disc space-y-1 pt-1 font-serif text-sm text-gray-800">
						<li>
							Developed an interactive <strong>3D model</strong> of the
							<strong>International Space Station (ISS)</strong> and its orbit using
							<strong>Three.js</strong> and <strong>JavaScript</strong>.
						</li>
					</ul>
				</div>
			</div>

			<!-- Skills Section -->
			<div>
				<h3
					class="mb-2 border-b border-black pb-1 font-serif text-lg font-bold uppercase text-black"
				>
					Skills
				</h3>
				<p class="pt-1 font-serif text-sm text-gray-800">
					<span class="font-semibold">Technical:</span> 3D Printing, Free CAD, Fusion 360, ESP32,
					RaspberryPi, Python, OpenCV-Python, PyTorch,FastAPI,JavaScript, ThreeJS, SvelteKit, Rust,
					Bevy, C++, Excel, Word, PowerPoint Presentation, Machine Learning, Data Engineering and
					Visualization, Git(hub),Database, Linux
					<br />
					<span class="font-semibold">Soft:</span> Teamwork, Leadership, Time Management, Creativity,
					Work Ethic, Communication, Organization, Collaboration, Mentorship, Problem Solving
				</p>
			</div>
			<!-- Projects and Awards sections are removed as their content is integrated above -->
		</div>
	</div>
</section>

{#if showBackToTop}
	<button
		on:click={viewAbout}
		class="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-opacity hover:bg-gray-800"
		aria-label="Back to About"
	>
		<ArrowUp size={24} />
	</button>
{/if}

<style>
	/* Grid Background */
	.grid-bg {
		--grid-color: var(--tw-color-gray-300);
		--grid-size: 40px;
		background-color: var(--tw-color-gray-100);
		background-image:
			linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
			linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
		background-size: var(--grid-size) var(--grid-size);
	}

	/* Style for social icons */
	.icon-link {
		transition: opacity 0.2s ease-in-out;
	}

	/* Resume Specific Styles */
	.section-title {
		/* All styles moved to HTML elements directly */
	}
	.section-content {
		/* All styles moved to HTML elements directly */
	}
	.item-container {
		/* All styles moved to HTML elements directly */
	}
	.item-title {
		/* All styles moved to HTML elements directly */
	}
	.item-subtitle {
		/* All styles moved to HTML elements directly */
	}
	.item-date {
		/* All styles moved to HTML elements directly */
	}
	.item-details-list {
		/* All styles moved to HTML elements directly */
	}
</style>
