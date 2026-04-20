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
			class="font-serif text-5xl leading-none font-bold uppercase sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem]"
		>
			MECHANICAL
		</h1>
		<h1
			class="font-serif text-5xl leading-none font-bold uppercase sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem]"
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
				class="flex items-center justify-center gap-2 rounded-sm bg-black px-8 py-3 font-serif text-lg font-medium tracking-wider text-white uppercase shadow-md transition-colors duration-200 hover:bg-gray-800"
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
				class="text-center font-serif text-4xl font-bold text-black uppercase sm:text-left sm:text-5xl md:text-6xl"
			>
				Bibek Bhatta
			</h2>
			<div class="flex flex-col gap-4 sm:flex-row">
				<button
					on:click={viewAbout}
					class="order-2 w-full rounded-sm border border-black bg-white px-6 py-3 font-serif text-base font-medium tracking-wider text-black uppercase shadow-md transition-colors duration-200 hover:bg-gray-100 sm:order-1 sm:w-auto"
				>
					Back to About
				</button>
				<a
					href="/BIBEK_BHATTA_LATEST_RESUME.pdf"
					download="BIBEK_BHATTA_RESUME.pdf"
					class="order-1 w-full rounded-sm bg-black px-6 py-3 text-center font-serif text-base font-medium tracking-wider text-white uppercase shadow-md transition-colors duration-200 hover:bg-gray-800 sm:order-2 sm:w-auto"
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
				<h3 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold tracking-wide uppercase">
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

			<!-- Experience Section -->
			<div>
				<h3 class="mb-6 border-b-2 border-black pb-2 text-xl font-bold tracking-wide uppercase">
					Experience
				</h3>
				<div class="space-y-8">
					<!-- Design Lead -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Design Lead</h4>
							<span class="text-sm font-semibold">January 2026 – Present</span>
						</div>
						<p class="text-base text-gray-700 italic">
							Robotics Club at Mississippi State University • Starkville, MS
						</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Modeling aerodynamic airframes, motor mounts, and a vibration-dampened flight
								controller housing in <strong>Onshape</strong>; manufactured prototypes using FDM
								<strong>3D printing</strong> in PETG filament.
							</li>
							<li>
								Engineering a standardized library of modular mechatronic subsystems, encompassing
								high-reduction cycloidal gearboxes, FDM-optimized differential drivetrains, 3D
								printable transmission shafts, and custom PCBs, to establish a reusable hardware
								architecture to accelerate cross-platform development for all club competitions.
							</li>
						</ul>
					</div>

					<!-- Undergraduate Researcher (Sustainable Bioproducts) -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Undergraduate Researcher</h4>
							<span class="text-sm font-semibold">March 2025 – Present</span>
						</div>
						<p class="text-base text-gray-700 italic">
							Department of Sustainable Bioproducts • Starkville, MS
						</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Designing an active-cooled, dust-resistant enclosure for an <strong
									>NVIDIA Jetson Orin Nano</strong
								> to manage thermal loads during edge-computing tasks.
							</li>
							<li>
								Deploying <strong>computer vision</strong> algorithms directly onto the embedded Jetson
								hardware to detect wood chip moisture content in real-time.
							</li>
							<li>
								Modeling a kinematic sensor mount in <strong>Onshape</strong> for repeatable camera positioning
								during physical image data collection.
							</li>
						</ul>
					</div>

					<!-- Undergraduate Researcher (Plant and Soil Sciences) -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Undergraduate Researcher</h4>
							<span class="text-sm font-semibold">October 2025 – February 2026</span>
						</div>
						<p class="text-base text-gray-700 italic">
							Department of Plant and Soil Sciences at Mississippi State University • Starkville, MS
						</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Designed and <strong>3D-printed</strong> an automated mechanical seed-feeder to stream
								samples into a camera's field of view at a controlled feed rate.
							</li>
							<li>
								Developed a real time <strong>ArUco</strong> calibrated
								<strong>computer vision</strong>
								seed measurement system and modular <strong>Python</strong> application, supporting
								<strong>CNN</strong> based seed and nodule analysis for PhD research
							</li>
						</ul>
					</div>

					<!-- Agrisense -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Machine Learning Developer</h4>
							<span class="text-sm font-semibold">February 2023 – June 2023</span>
						</div>
						<p class="text-base text-gray-700 italic">Agrisense • Kathmandu, Nepal</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Developed and implemented a custom <strong>CNN-based image processing model</strong>
								utilizing <strong>Scikit-learn</strong>, <strong>NumPy</strong>, and
								<strong>OpenCV</strong> for plant disease detection to enhance agricultural diagnostics
							</li>
							<li>
								Modeled a wheeled sensor-deployment rig in <strong>FreeCAD</strong>; optimized
								<strong>3D-printed PLA</strong> components for wall thickness, dynamic load-bearing,
								and minimal support structures.
							</li>
						</ul>
					</div>

					<!-- NASA Space Apps -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Project Lead / Lead Developer</h4>
							<span class="text-sm font-semibold">October 2022 – November 2022</span>
						</div>
						<p class="text-base text-gray-700 italic">
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

			<!-- Education Section -->
			<div>
				<h3 class="mb-6 border-b-2 border-black pb-2 text-xl font-bold tracking-wide uppercase">
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
							<p class="text-lg text-gray-700 italic">Mississippi State University</p>
							<span class="text-base text-gray-700">Starkville, Mississippi</span>
						</div>

						<div class="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]">
							<div class="font-bold text-black">GPA:</div>
							<div class="text-lg font-bold text-black">3.92 / 4.0</div>

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
							<p class="text-lg text-gray-700 italic">St. Xavier's College</p>
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

			<!-- Skills Section -->
			<div>
				<h3 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold tracking-wide uppercase">
					Skills
				</h3>
				<div class="grid gap-8 text-base text-gray-800 sm:grid-cols-2">
					<!-- Technical Skills Column -->
					<div>
						<h4 class="mb-3 text-lg font-bold text-black underline">Technical</h4>

						<div class="space-y-4">
							<div>
								<span
									class="mb-1 block text-sm font-semibold tracking-wider text-gray-500 uppercase"
									>Languages & Frameworks</span
								>
								<p class="leading-relaxed">
									Python, C++, Rust, JavaScript, SvelteKit, FastAPI, ThreeJS
								</p>
							</div>

							<div>
								<span
									class="mb-1 block text-sm font-semibold tracking-wider text-gray-500 uppercase"
									>AI & Computer Vision</span
								>
								<p class="leading-relaxed">PyTorch, OpenCV, Machine Learning, Data Engineering</p>
							</div>

							<div>
								<span
									class="mb-1 block text-sm font-semibold tracking-wider text-gray-500 uppercase"
									>Hardware & Engineering</span
								>
								<p class="leading-relaxed">ESP32, RaspberryPi, 3D Printing, Linux</p>
							</div>

							<div>
								<span
									class="mb-1 block text-sm font-semibold tracking-wider text-gray-500 uppercase"
									>CAD & Tools</span
								>
								<p class="leading-relaxed">
									Certified Onshape Associate, OnShape, FreeCAD, Fusion 360, Git, Database
								</p>
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
		class="fixed right-6 bottom-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-opacity hover:bg-gray-800"
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
