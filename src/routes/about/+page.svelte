<script>
	// Icons are needed again
	import { Mail, Github, Linkedin, Instagram, Facebook, Phone, MapPin } from 'lucide-svelte';
	import { tick } from 'svelte'; // Import tick

	let showResume = false; // State to control which section is visible

	function scrollToElement(elementId) {
		const element = document.getElementById(elementId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	async function viewResume() {
		showResume = true;
		await tick(); // Wait for the DOM to update
		scrollToElement('resume-section'); // Scroll to the top of the resume section
		window.scrollTo({ top: 0, behavior: 'smooth' }); // Ensure viewport is at the top
	}

	async function viewAbout() {
		showResume = false;
		await tick(); // Wait for the DOM to update
		scrollToElement('about-section-top'); // Scroll to the top of the about section
		window.scrollTo({ top: 0, behavior: 'smooth' }); // Ensure viewport is at the top
	}
</script>

<svelte:head>
	<title>About Me - Bibek Bhatta</title>
	<meta name="description" content="Learn more about Bibek Bhatta, a Mechanical Engineer." />
</svelte:head>

<!-- Conditionally render About Section -->
{#if !showResume}
	<div
		id="about-section-top"
		class="grid-bg relative flex min-h-screen items-center justify-center bg-gray-100 px-4 py-16 text-black sm:px-6 md:py-24 lg:px-12"
	>
		<!-- Large Stacked Text -->
		<div class="z-10 text-center">
			<!-- Centered the content here -->
			<h1
				class="font-serif text-6xl font-bold uppercase leading-none sm:text-8xl md:text-9xl lg:text-[9rem] xl:text-[10rem]"
			>
				MECHANICAL
			</h1>
			<h1
				class="font-serif text-6xl font-bold uppercase leading-none sm:text-8xl md:text-9xl lg:text-[9rem] xl:text-[10rem]"
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
			<div class="mt-12 text-center">
				<button
					on:click={viewResume}
					class="rounded-sm bg-black px-8 py-3 font-serif text-lg font-medium uppercase tracking-wider text-white shadow-md transition-colors duration-200 hover:bg-gray-800"
				>
					View My Resume
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Conditionally render Resume Section -->
{#if showResume}
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
						href="/BB_RESUME.pdf"
						download="BB_RESUME.pdf"
						class="order-1 w-full rounded-sm bg-black px-6 py-3 text-center font-serif text-base font-medium uppercase tracking-wider text-white shadow-md transition-colors duration-200 hover:bg-gray-800 sm:order-2 sm:w-auto"
					>
						Download PDF
					</a>
				</div>
			</div>

			<div class="mb-8 text-center font-serif text-sm text-gray-700">
				<div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:gap-x-3">
					<a
						href="mailto:beebekismee@gmail.com"
						class="flex items-center text-blue-600 hover:underline"
					>
						<Mail size={16} class="mr-1.5" />
						beebekismee@gmail.com
					</a>
					<span class="hidden text-gray-400 sm:inline">|</span>
					<span class="flex items-center">
						<Phone size={16} class="mr-1.5" />
						(+1) 571-602-3140
					</span>
					<span class="hidden text-gray-400 sm:inline">|</span>
					<span class="flex items-center">
						<MapPin size={16} class="mr-1.5" />
						Geneva, New York, USA
					</span>
				</div>
				<div class="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:gap-x-3">
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

			<div class="space-y-10">
				<!-- Summary Section -->
				<div>
					<h3
						class="mb-4 border-b-2 border-gray-400 pb-2 font-serif text-2xl font-semibold text-gray-800 sm:text-3xl"
					>
						Summary
					</h3>
					<p class="font-serif text-base leading-relaxed text-gray-700 sm:text-lg">
						Python Developer with over 4 years of experience, proficient in Python and its libraries
						such as FastAPI, PyTorch, Pandas, and NumPy. Passionate about Machine Learning, and
						API's with a proven track record of contributing to open-source projects. Skilled in
						data analysis and visualization using tools like Matplotlib and Seaborn. Experienced
						with version control (Git), and cloud services (Heroku). Strong analytical and
						problem-solving abilities, and a dedicated math enthusiast.
					</p>
				</div>

				<!-- Experience Section -->
				<div>
					<h3
						class="mb-4 border-b-2 border-gray-400 pb-2 font-serif text-2xl font-semibold text-gray-800 sm:text-3xl"
					>
						Experience
					</h3>
					<div class="mb-2">
						<h4 class="mb-1 font-serif text-xl font-medium text-black sm:text-2xl">
							Backend Engineer and Machine Learning Developer
						</h4>
						<p class="text-md mb-0.5 font-serif text-gray-600 sm:text-lg">
							usjany.com • Kathmandu, Bagmati
						</p>
						<p class="font-serif text-sm text-gray-500">08/2024 - Present</p>
						<ul
							class="mt-2 list-inside list-disc space-y-2 font-serif text-base leading-relaxed text-gray-700 sm:text-lg"
						>
							<li>
								Working on a production-level backend server written in FastAPI - Python and Python
								libraries(BeautifulSoup, Requests) and Postgres as the database server.
							</li>
							<li>
								Working on custom Large Language Model powered by open source LLAMA-3.1 8b model
								from Meta AI with RAG.
							</li>
						</ul>
					</div>
					<div class="mb-2 mt-4">
						<h4 class="mb-1 font-serif text-xl font-medium text-black sm:text-2xl">
							Technical Lead/Developer
						</h4>
						<p class="text-md mb-0.5 font-serif text-gray-600 sm:text-lg">
							Mathematical Association of Nepal • Kathmandu, Bagmati
						</p>
						<p class="font-serif text-sm text-gray-500">06/2021 - Present</p>
						<ul
							class="mt-2 list-inside list-disc space-y-2 font-serif text-base leading-relaxed text-gray-700 sm:text-lg"
						>
							<li>
								Developed registration and training software using Python, FastAPI, DaisyUI, and
								SvelteKit, enhancing user experience and operational efficiency.
							</li>
							<li>
								Created training software with pure Python and DearPyGUI, supported by a FastAPI
								backend, streamlining training processes and improving functionality.
							</li>
							<li>
								Wrote PDF to image generator for LATEX processing and made a custom database for
								math problems in MongoDB.
							</li>
						</ul>
					</div>
					<div class="mb-2 mt-4">
						<h4 class="mb-1 font-serif text-xl font-medium text-black sm:text-2xl">
							Machine Learning Developer
						</h4>
						<p class="text-md mb-0.5 font-serif text-gray-600 sm:text-lg">
							Agrisense • Kathmandu, Bagmati
						</p>
						<p class="font-serif text-sm text-gray-500">02/2023 - 06/2023</p>
						<ul
							class="mt-2 list-inside list-disc space-y-2 font-serif text-base leading-relaxed text-gray-700 sm:text-lg"
						>
							<li>
								Developed a custom CNN-based image processing model for plant disease detection,
								enhancing agricultural diagnostics.
							</li>
							<li>
								Utilized Scikit-learn, NumPy, and OpenCV to create and implement the model, ensuring
								high accuracy and efficiency.
							</li>
						</ul>
					</div>
					<div class="mb-2 mt-4">
						<h4 class="mb-1 font-serif text-xl font-medium text-black sm:text-2xl">
							Machine Learning Developer
						</h4>
						<p class="text-md mb-0.5 font-serif text-gray-600 sm:text-lg">
							Traverse • Kathmandu, Bagmati
						</p>
						<p class="font-serif text-sm text-gray-500">12/2022 - 05/2023</p>
						<ul
							class="mt-2 list-inside list-disc space-y-2 font-serif text-base leading-relaxed text-gray-700 sm:text-lg"
						>
							<li>
								Developed a custom recommendation engine to suggest places based on user itinerary
								and location, enhancing user experience and personalization.
							</li>
							<li>
								Utilized NumPy and PyTorch to build and implement the engine, ensuring robust and
								accurate recommendations.
							</li>
						</ul>
					</div>
					<div class="mb-2 mt-4">
						<h4 class="mb-1 font-serif text-xl font-medium text-black sm:text-2xl">
							Three JS Developer
						</h4>
						<p class="text-md mb-0.5 font-serif text-gray-600 sm:text-lg">
							NASA Space APPS Challenge • Kathmandu, Bagmati
						</p>
						<p class="font-serif text-sm text-gray-500">10/2022 - 11/2022</p>
						<ul
							class="mt-2 list-inside list-disc space-y-2 font-serif text-base leading-relaxed text-gray-700 sm:text-lg"
						>
							<li>
								Developed a 3D model of the International Space Station (ISS) using Three.js,
								simulating its orbit around the globe.
							</li>
							<li>
								Utilized Three.js and JavaScript exclusively to achieve realistic and interactive
								simulations.
							</li>
						</ul>
					</div>
				</div>

				<!-- Education Section -->
				<div>
					<h3
						class="mb-4 border-b-2 border-gray-400 pb-2 font-serif text-2xl font-semibold text-gray-800 sm:text-3xl"
					>
						Education
					</h3>
					<div class="mb-2">
						<h4 class="font-serif text-xl font-medium text-black sm:text-2xl">A-Levels</h4>
						<p class="text-md font-serif italic text-gray-600 sm:text-lg">
							St.Xavier's College • Kathmandu, Bagmati
						</p>
						<p class="font-serif text-sm text-gray-500">08/2023</p>
						<ul
							class="mt-2 list-inside list-disc space-y-1 font-serif text-base text-gray-700 sm:text-lg"
						>
							<li>Bronze Honor International Youth Math Challenge.</li>
							<li>Bronze National Science Exhibition</li>
							<li>Bronze Budanilkantha National Math League</li>
							<li>Gold Provincial Information Technology Olympiad</li>
							<li>Silver National Information Technology Olympiad</li>
						</ul>
					</div>
					<div class="mb-2 mt-4">
						<h4 class="font-serif text-xl font-medium text-black sm:text-2xl">SEE</h4>
						<p class="text-md font-serif italic text-gray-600 sm:text-lg">
							Little Buddha Academy • Kanchanpur, Sudurpaschim
						</p>
						<p class="font-serif text-sm text-gray-500">08/2021</p>
					</div>
				</div>

				<!-- Skills Section -->
				<div>
					<h3
						class="mb-4 border-b-2 border-gray-400 pb-2 font-serif text-2xl font-semibold text-gray-800 sm:text-3xl"
					>
						Skills
					</h3>
					<p class="font-serif text-base leading-relaxed text-gray-700 sm:text-lg">
						Python, ThreeJS, SvelteKit, Rust, Pytorch, FastAPI, niceGUI, Mathematics and more to
						come as I learn...
					</p>
				</div>
				<!-- Projects and Awards sections are removed as their content is integrated above -->
			</div>
		</div>
	</section>
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
