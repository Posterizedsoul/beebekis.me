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
					href="/BIBEK_BHATTA_RESUME.pdf"
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
					Mechanical Engineering undergraduate focused on <strong>aerospace autonomy</strong> and
					<strong>robotics</strong>. Designs full mechatronic systems spanning <strong>CAD</strong>
					and <strong>FDM hardware</strong>, <strong>embedded computer vision</strong>, and
					<strong>autonomous control</strong>, with hands-on <strong>UAV</strong>,
					<strong>drivetrain</strong>, and <strong>perception</strong> experience.
				</p>
			</div>

			<!-- Technical Skills & Certifications -->
			<div>
				<h3 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold tracking-wide uppercase">
					Technical Skills &amp; Certifications
				</h3>
				<ul class="list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
					<li>
						<strong>CAD / CAE:</strong> SolidWorks, Onshape, FreeCAD; SolidWorks Flow Simulation (CFD),
						FEA, GD&amp;T, tolerance stack-up; gear and drivetrain design
					</li>
					<li>
						<strong>Manufacturing:</strong> FDM 3D printing (PLA / PLA+ / ABS), DFM, design for thermal
						management, 3030 extrusion fixtures
					</li>
					<li>
						<strong>Mechatronics:</strong> EDF and tilt-mechanism design, NEMA steppers, lead-screw linear
						motion, cycloidal and planetary gearboxes, Arduino, GRBL, Altium PCB design
					</li>
					<li>
						<strong>Programming / Perception:</strong> Python, PyTorch, OpenCV (ArUco), Scikit-learn,
						NumPy, FastAPI
					</li>
					<li>
						<strong>Embedded / Autonomy:</strong> NVIDIA Jetson (Orin Nano), Pixhawk / PX4, GPS waypoint
						navigation, geofencing and fail safes, A* path planning, dataset annotation
					</li>
				</ul>
			</div>

			<!-- Projects Section -->
			<div>
				<h3 class="mb-6 border-b-2 border-black pb-2 text-xl font-bold tracking-wide uppercase">
					Projects
				</h3>
				<div>
					<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
						<h4 class="text-lg font-bold">Autonomous VTOL Medical-Delivery UAV</h4>
						<span class="text-sm font-semibold">2026 &ndash; Present</span>
					</div>
					<p class="text-base text-gray-700 italic">
						Personal Research via MSU Robotics Club &bull; Starkville, MS
					</p>
					<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
						<li>
							Designing a <strong>1 m-wingspan tri-EDF tiltrotor VTOL</strong> (two wing-mounted and
							one tail-mounted ducted fan, all tilting in a V-22 Osprey-style configuration) for autonomous
							medical-supply delivery, a concept developed since high school and brought into full CAD
							and prototyping at MSU; currently lifting 800g against a 3 to 5 kg design target.
						</li>
						<li>
							Built a fully <strong>3D-printed airframe</strong> and modular cargo bay for rapid prototype
							iteration, powered by LiPo 5200 mAh 7.2 V (2S).
						</li>
						<li>
							Sized wing geometry, propulsion, and stability margins using hand calculations and
							spreadsheet models, validated with <strong>SolidWorks Flow Simulation (CFD)</strong>,
							iterating the airframe to balance range, payload, and stability.
						</li>
						<li>
							Integrated a <strong>Holybro Pixhawk Standard Baseboard V2A</strong> running
							<strong>PX4</strong>, implementing GPS waypoint-following with geofence and altitude
							failsafe that auto-recover when the aircraft exits its designated zone or ceiling.
						</li>
						<li>
							Prototyping autonomous routing with <strong>A* path planning</strong> and evaluating voxel-based
							methods for 3D obstacle-aware navigation; road mapping a migration from the COTS controller
							to a custom flight computer for full control of the autonomy and sensor-fusion stack.
						</li>
					</ul>
				</div>
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
							<span class="text-sm font-semibold">January 2026 &ndash; Present</span>
						</div>
						<p class="text-base text-gray-700 italic">
							Robotics Club, Mississippi State University &bull; Starkville, MS
						</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Leading mechanical design for the club's entry in <strong
									>NASA's Fly Foundational Robots (FFR) ISAM mission</strong
								>, developing a prototype robotic grabber and self-assembling structural modules
								that autonomously join into a functional structure for an in-orbit-assembly
								demonstration.
							</li>
							<li>
								Designed a standardized, <strong
									>3D-printable library of mechatronic subsystems</strong
								>
								(cycloidal and planetary gearboxes, lead-screw linear stages on NEMA steppers, and matching
								motor controllers) so any club team can print and prototype drivetrains to a common standard
								instead of sourcing or reverse-engineering COTS parts.
							</li>
						</ul>
					</div>

					<!-- Undergraduate Researcher (Sustainable Bioproducts) -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Undergraduate Researcher</h4>
							<span class="text-sm font-semibold">February 2026 &ndash; Present</span>
						</div>
						<p class="text-base text-gray-700 italic">
							Department of Sustainable Bioproducts, Mississippi State University &bull; Starkville,
							MS
						</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Designed a <strong>multi-illumination imaging rig</strong> to grade Gibson guitar
								tonewood (2A / 3A / 4A) for a PhD-led <strong>CNN quality-control model</strong>: a
								FLIR Blackfly camera with dual synchronized LEDs in a controlled dark enclosure,
								capturing three exposures per sample (each light independently, then combined) to
								characterize the specular figure of high-grade wood; fixtures 3D-printed in PLA+.
							</li>
							<li>
								Wrote <strong>Python capture software</strong> that triggers synchronized lighting and
								acquisition from a single keypress and assembled a labeled dataset of roughly 1,200 samples
								(about 3,600 images) across three grades.
							</li>
							<li>
								Designing a <strong>handheld field device</strong> integrating the lighting, camera,
								and trained model for in-the-wild grade testing by Gibson wood suppliers (July 2026).
							</li>
							<li>
								Designed an automated <strong>4-camera gantry</strong> spanning roughly 2.4 m of
								travel for cuboidal-log imaging: a 3030-aluminum square fixture with four
								independently positionable FLIR Blackfly cameras plus whole-gantry travel, driven by
								NEMA 17 steppers through planetary and cycloidal (27:1) reducers sized for ample
								torque margin, with lead-screw motion on all axes, controlled by an Arduino running
								<strong>GRBL</strong>.
							</li>
							<li>
								Provisioned an <strong>NVIDIA Jetson Orin Nano</strong> (Linux and ML toolchain) for
								edge wood-chip moisture detection and annotated a 7,000-image training dataset; designed
								an active-cooled, dust-resistant enclosure (heatsink and fan) to hold the board below
								50&deg;C in-mill.
							</li>
						</ul>
					</div>

					<!-- Undergraduate Researcher (Plant and Soil Sciences) -->
					<div>
						<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
							<h4 class="text-lg font-bold">Undergraduate Researcher</h4>
							<span class="text-sm font-semibold">October 2025 &ndash; February 2026</span>
						</div>
						<p class="text-base text-gray-700 italic">
							Department of Plant and Soil Sciences, Mississippi State University &bull; Starkville,
							MS
						</p>
						<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
							<li>
								Designed and <strong>3D-printed</strong> an automated vibratory seed-feeder that singulates
								seeds and streams them into a camera's field of view for hands-free, repeatable imaging.
							</li>
							<li>
								Built an <strong>ArUco-calibrated vision station</strong> using marker-based homography
								to correct camera perspective distortion and constrain the region of interest, feeding
								an ML model that counts seeds and extracts per-seed metrics (area, length, width); processed
								roughly 200 seeds per 5-second capture with no fixed object-count limit, populating a
								research seed-trait database.
							</li>
							<li>
								Validated the system on sunflower and soybean samples and delivered the imaging
								enclosure and pipeline to the research team.
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
							<p class="text-lg text-gray-700 italic">Mississippi State University &bull; Junior</p>
							<span class="text-base text-gray-700">Starkville, Mississippi</span>
						</div>
						<ul class="mt-4 list-inside list-disc space-y-1 text-base text-gray-800">
							<li>Colvard Future Leader Scholarship</li>
							<li>Freshman Academic Excellence Scholarship</li>
							<li>President's List &mdash; Summer &amp; Fall 2025</li>
							<li>Dean's List &mdash; Spring 2026</li>
						</ul>
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
