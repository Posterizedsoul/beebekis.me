<script lang="ts">
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

	function scrollToElement(elementId: string) {
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

		<div class="mx-auto max-w-4xl space-y-12 text-left font-serif text-black">
			<!-- Summary Section -->
			<div>
				<h3 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold uppercase tracking-wide">
					Summary
				</h3>
				<p class="text-base leading-relaxed text-gray-800">
					Mechanical Engineering undergraduate with <strong>6+ years</strong> of experience applying
					<strong>Python</strong>, <strong>machine learning</strong>, and
					<strong>computer vision</strong> to engineering and robotics focused problems. Strong
					background in <strong>electronics</strong>, <strong>3D printing</strong>, and
					<strong>embedded systems</strong>, with hands-on experience in
					<strong>perception</strong>, <strong>data-driven modeling</strong>, and
					<strong>control-oriented systems</strong>. Experienced with <strong>FastAPI</strong>,
					<strong>PyTorch</strong>, <strong>OpenCV</strong> and
					<strong>scientific computing</strong>. Highly interested in <strong>robotics</strong>,
					<strong>UAV systems</strong>, <strong>aerodynamics</strong>, and
					<strong>autonomous control system design</strong>.
				</p>
			</div>

			<!-- Education Section -->
			<div>
				<h3 class="mb-6 border-b-2 border-black pb-2 text-xl font-bold uppercase tracking-wide">
					Education
				</h3>
				<div class="space-y-10">
					<!-- MSU -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-xl font-bold text-black">
								Bachelor of Science in Mechanical Engineering
							</h4>
							<span class="text-sm font-semibold">December 2028</span>
						</div>
						<div class="mt-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<p class="text-lg italic text-gray-700">Mississippi State University</p>
							<span class="text-base text-gray-700">Starkville, Mississippi</span>
						</div>

						<div class="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]">
							<div class="font-bold text-black">GPA:</div>
							<div class="text-lg font-bold text-black">4.0 / 4.0</div>

							<div class="font-bold text-black">Honors:</div>
							<ul class="list-inside list-disc space-y-1 text-base text-gray-800">
								<li>Colvard Future Leader Scholarship</li>
								<li>Freshman Academic Excellence Scholarship</li>
								<li>Presidents List — Summer & Fall 2025</li>
							</ul>
						</div>
					</div>

					<!-- Cambridge -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-xl font-bold text-black">Cambridge International Advanced Levels</h4>
							<span class="text-sm font-semibold">August 2023</span>
						</div>
						<div class="mt-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<p class="text-lg italic text-gray-700">St. Xavier's College</p>
							<span class="text-base text-gray-700">Maitighar, Kathmandu</span>
						</div>

						<div class="mt-4">
							<span class="mb-2 block text-lg font-bold text-black">Awards & Achievements:</span>
							<ul
								class="grid list-inside list-disc gap-x-8 gap-y-2 text-base text-gray-800 sm:grid-cols-2"
							>
								<li>
									<strong class="text-black">Gold</strong> — Provincial Information Technology Olympiad
								</li>
								<li>
									<strong class="text-black">Silver</strong> — National Information Technology Olympiad
								</li>
								<li>
									<strong class="text-black">Bronze</strong> — International Youth Math Challenge
								</li>
								<li>
									<strong class="text-black">Bronze</strong> — Budanilkantha National Math League
								</li>
								<li><strong class="text-black">Bronze</strong> — National Science Exhibition</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<!-- Experience Section -->
			<div>
				<h3 class="mb-6 border-b-2 border-black pb-2 text-xl font-bold uppercase tracking-wide">
					Experience
				</h3>
				<div class="space-y-8">
					<!-- Undergraduate Researcher -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Undergraduate Researcher</h4>
							<span class="text-sm font-semibold">October 2025 – Present</span>
						</div>
						<p class="text-base italic text-gray-700">
							Department of Plant and Soil Sciences at Mississippi State University
						</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Develop a real-time <strong>ArUco</strong>-calibrated
								<strong>computer vision</strong>
								seed measurement system and modular Python application, supporting
								<strong>CNN</strong>-based seed and nodule analysis for PhD research.
							</li>
							<li>
								First author on a paper accepted for oral and poster presentation at the
								<strong>90th Mississippi Academy of Sciences Conference 2026</strong>.
							</li>
						</ul>
					</div>

					<!-- Technical Lead -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Technical Lead</h4>
							<span class="text-sm font-semibold">September 2022 – Present</span>
						</div>
						<p class="text-base italic text-gray-700">Mathematical Association of Nepal</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Develop comprehensive registration and training software using <strong
									>Python</strong
								>,
								<strong>FastAPI</strong>, <strong>DaisyUI</strong> and <strong>SvelteKit</strong>,
								significantly enhancing user experience and operational efficiency.
							</li>
							<li>
								Create a custom <strong>PDF-to-image generator</strong> for <strong>LaTeX</strong>
								processing and design a specialized <strong>MongoDB</strong> database for mathematical
								problems.
							</li>
						</ul>
					</div>

					<!-- Backend Engineer -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Backend Engineer & ML Developer</h4>
							<span class="text-sm font-semibold">August 2024 – June 2025</span>
						</div>
						<p class="text-base italic text-gray-700">usjany • Kathmandu, Nepal</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
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

					<!-- Agrisense -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Machine Learning Developer</h4>
							<span class="text-sm font-semibold">February 2023 – June 2023</span>
						</div>
						<p class="text-base italic text-gray-700">Agrisense • Kathmandu, Nepal</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Developed and implemented a custom <strong>CNN-based image processing model</strong>
								utilizing
								<strong>Scikit-learn</strong>, <strong>NumPy</strong>, and <strong>OpenCV</strong> for
								plant disease detection to enhance agricultural diagnostics.
							</li>
							<li>
								Modelled a sanctuary in <strong>Free CAD</strong> and <strong>3D-printed</strong> it
								in
								<strong>PLA</strong>, optimizing the design for <strong>FDM printing</strong> with proper
								wall thickness, layer height, and minimal supports.
							</li>
						</ul>
					</div>

					<!-- Traverse -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Machine Learning Developer</h4>
							<span class="text-sm font-semibold">December 2022 – May 2023</span>
						</div>
						<p class="text-base italic text-gray-700">Traverse • Kathmandu, Nepal</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Engineered a custom <strong>recommendation engine</strong> using
								<strong>NumPy</strong>
								and <strong>PyTorch</strong> to suggest places based on user itineraries, enhancing user
								personalization and engagement.
							</li>
						</ul>
					</div>

					<!-- NASA Space Apps -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Project Lead / Lead Developer</h4>
							<span class="text-sm font-semibold">October 2022 – November 2022</span>
						</div>
						<p class="text-base italic text-gray-700">
							NASA Space Apps Challenge • Kathmandu, Nepal
						</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Developed an interactive <strong>3D model</strong> of the
								<strong>International Space Station (ISS)</strong> and its orbit using
								<strong>Three.js</strong> and <strong>JavaScript</strong>.
							</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Skills Section -->
			<div>
				<h3 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold uppercase tracking-wide">
					Skills
				</h3>
				<div class="grid gap-8 text-base text-gray-800 sm:grid-cols-2">
					<!-- Technical Skills Column -->
					<div>
						<h4 class="mb-3 text-lg font-bold text-black underline">Technical</h4>

						<div class="space-y-4">
							<div>
								<span
									class="mb-1 block text-sm font-semibold uppercase tracking-wider text-gray-500"
									>Languages & Frameworks</span
								>
								<p class="leading-relaxed">
									Python, C++, Rust, JavaScript, SvelteKit, FastAPI, ThreeJS
								</p>
							</div>

							<div>
								<span
									class="mb-1 block text-sm font-semibold uppercase tracking-wider text-gray-500"
									>AI & Computer Vision</span
								>
								<p class="leading-relaxed">PyTorch, OpenCV, Machine Learning, Data Engineering</p>
							</div>

							<div>
								<span
									class="mb-1 block text-sm font-semibold uppercase tracking-wider text-gray-500"
									>Hardware & Engineering</span
								>
								<p class="leading-relaxed">ESP32, RaspberryPi, 3D Printing, Linux</p>
							</div>

							<div>
								<span
									class="mb-1 block text-sm font-semibold uppercase tracking-wider text-gray-500"
									>CAD & Tools</span
								>
								<p class="leading-relaxed">OnShape, FreeCAD, Fusion 360, Git, Database</p>
							</div>
						</div>
					</div>

					<!-- Soft Skills Column -->
					<div>
						<h4 class="mb-3 text-lg font-bold text-black underline">Soft Skills</h4>
						<ul class="list-inside list-disc space-y-1.5 leading-relaxed">
							<li>Leadership & Mentorship</li>
							<li>Communication & Collaboration</li>
							<li>Problem Solving & Creativity</li>
							<li>Time Management & Organization</li>
							<li>Work Ethic & Reliability</li>
						</ul>
					</div>
				</div>
			</div>
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
</style>
