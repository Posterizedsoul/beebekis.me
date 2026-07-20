<script lang="ts">
	import { Mail, Github, Linkedin, Instagram, Facebook, Phone, X, FileText } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let resumeOpen = false;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') resumeOpen = false;
	}

	// Lock page scroll while the resume panel is open
	$: if (browser) {
		document.body.style.overflow = resumeOpen ? 'hidden' : '';
	}
</script>

<svelte:head>
	<title>About Bibek Bhatta — Mechanical Engineer</title>
	<meta
		name="description"
		content="About Bibek Bhatta — Mechanical Engineering undergraduate at Mississippi State University working on aerospace autonomy, UAV systems, robotics, and computer vision."
	/>
	<link rel="canonical" href="https://bibekbhatta.com/about" />
	<meta property="og:type" content="profile" />
	<meta property="og:url" content="https://bibekbhatta.com/about" />
	<meta property="og:title" content="About Bibek Bhatta — Mechanical Engineer" />
	<meta
		property="og:description"
		content="Mechanical Engineering undergraduate working on aerospace autonomy, UAV systems, robotics, and computer vision."
	/>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

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
				on:click={() => (resumeOpen = true)}
				class="flex items-center justify-center gap-2 rounded-sm bg-black px-8 py-3 font-serif text-lg font-medium tracking-wider text-white uppercase shadow-md transition-colors duration-200 hover:bg-gray-800"
			>
				View My Resume
				<FileText size={22} />
			</button>
		</div>
	</div>
</div>

<!-- Written intro. Lives here rather than on the homepage so the homepage can
     stay a single non-scrolling piece, while this stays genuinely visible to
     both readers and crawlers. -->
<section id="intro" class="intro">
	<div class="intro-inner">
		<h2 class="intro-heading">Mechanical Engineer</h2>
		<p class="intro-lead">
			I'm <strong>Bibek Bhatta</strong>, a Mechanical Engineering undergraduate at
			<strong>Mississippi State University</strong> working at the intersection of aerospace autonomy
			and robotics. I design complete mechatronic systems — from CAD and 3D-printed hardware to embedded
			computer vision and autonomous flight control.
		</p>
		<p class="intro-body">
			My current work includes an autonomous <strong>VTOL medical-delivery UAV</strong> (a tri-EDF
			tiltrotor running PX4 with GPS waypoint navigation and A* path planning), a
			<strong>multi-illumination imaging rig</strong> grading guitar tonewood for a CNN quality-control
			model, and a standardized library of 3D-printable mechatronic subsystems — cycloidal and planetary
			gearboxes, lead-screw stages, and custom motor controllers — built as Design Lead for the MSU Robotics
			Club's NASA ISAM entry.
		</p>

		<ul class="focus-list">
			<li>CAD &amp; CAE — SolidWorks, Onshape, CFD, FEA, GD&amp;T</li>
			<li>Robotics &amp; UAV systems — PX4, Pixhawk, autonomous control</li>
			<li>Computer vision &amp; ML — Python, PyTorch, OpenCV, NVIDIA Jetson</li>
			<li>Design for manufacturing — FDM 3D printing, drivetrain design</li>
		</ul>

		<nav class="intro-links" aria-label="Explore this site">
			<a href="/projects">View my projects →</a>
			<a href="/blog">Read the blog →</a>
		</nav>
	</div>
</section>

<!-- Resume overlay (Prime-style panel) -->
{#if resumeOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="overlay-backdrop fixed inset-0 z-[80]" on:click={() => (resumeOpen = false)}></div>

	<div class="pointer-events-none fixed inset-0 z-[85] flex items-center justify-center p-3 md:p-8">
		<div
			class="overlay-panel pointer-events-auto flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
		>
			<!-- Panel header -->
			<header
				class="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-6 py-4"
			>
				<h2
					class="truncate font-serif text-3xl font-bold tracking-wide text-black uppercase sm:text-4xl md:text-5xl"
				>
					Bibek Bhatta
				</h2>
				<div class="flex flex-shrink-0 items-center gap-3">
					<a
						href="/BIBEK_BHATTA_RESUME.pdf"
						download="BIBEK_BHATTA_RESUME.pdf"
						class="rounded-sm bg-black px-4 py-2 text-center font-serif text-sm font-medium tracking-wider text-white uppercase transition-colors duration-200 hover:bg-gray-800"
					>
						Download PDF
					</a>
					<button
						on:click={() => (resumeOpen = false)}
						class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
						aria-label="Close resume"
					>
						<X size={20} />
					</button>
				</div>
			</header>

			<!-- Scrollable resume content -->
			<div class="flex-1 overflow-y-auto px-6 py-8 md:px-10">
				<div class="mb-8 text-center font-serif text-sm text-gray-700">
					<div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:gap-x-3">
						<a
							href="mailto:bb3017@msstate.edu"
							class="flex items-center text-blue-600 hover:underline"
						>
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

				<div class="mx-auto max-w-5xl space-y-12 text-left font-serif text-black">
					<!-- Summary Section -->
					<div>
						<h3 class="mb-4 border-b-2 border-black pb-2 text-xl font-bold tracking-wide uppercase">
							Summary
						</h3>
						<p class="text-base leading-relaxed text-gray-800">
							Mechanical Engineering undergraduate focused on <strong>aerospace autonomy</strong>
							and
							<strong>robotics</strong>. Designs full mechatronic systems spanning
							<strong>CAD</strong>
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
								<strong>CAD / CAE:</strong> SolidWorks, Onshape, FreeCAD; SolidWorks Flow Simulation
								(CFD), FEA, GD&amp;T, tolerance stack-up; gear and drivetrain design
							</li>
							<li>
								<strong>Manufacturing:</strong> FDM 3D printing (PLA / PLA+ / ABS), DFM, design for thermal
								management, 3030 extrusion fixtures
							</li>
							<li>
								<strong>Mechatronics:</strong> EDF and tilt-mechanism design, NEMA steppers, lead-screw
								linear motion, cycloidal and planetary gearboxes, Arduino, GRBL, Altium PCB design
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
									Designing a <strong>1 m-wingspan tri-EDF tiltrotor VTOL</strong> (two wing-mounted
									and one tail-mounted ducted fan, all tilting in a V-22 Osprey-style configuration)
									for autonomous medical-supply delivery, a concept developed since high school and brought
									into full CAD and prototyping at MSU; currently lifting 800g against a 3 to 5 kg design
									target.
								</li>
								<li>
									Built a fully <strong>3D-printed airframe</strong> and modular cargo bay for rapid
									prototype iteration, powered by LiPo 5200 mAh 7.2 V (2S).
								</li>
								<li>
									Sized wing geometry, propulsion, and stability margins using hand calculations and
									spreadsheet models, validated with <strong
										>SolidWorks Flow Simulation (CFD)</strong
									>, iterating the airframe to balance range, payload, and stability.
								</li>
								<li>
									Integrated a <strong>Holybro Pixhawk Standard Baseboard V2A</strong> running
									<strong>PX4</strong>, implementing GPS waypoint-following with geofence and
									altitude failsafe that auto-recover when the aircraft exits its designated zone or
									ceiling.
								</li>
								<li>
									Prototyping autonomous routing with <strong>A* path planning</strong> and evaluating
									voxel-based methods for 3D obstacle-aware navigation; road mapping a migration from
									the COTS controller to a custom flight computer for full control of the autonomy and
									sensor-fusion stack.
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
										(cycloidal and planetary gearboxes, lead-screw linear stages on NEMA steppers, and
										matching motor controllers) so any club team can print and prototype drivetrains
										to a common standard instead of sourcing or reverse-engineering COTS parts.
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
									Department of Sustainable Bioproducts, Mississippi State University &bull;
									Starkville, MS
								</p>
								<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
									<li>
										Designed a <strong>multi-illumination imaging rig</strong> to grade Gibson
										guitar tonewood (2A / 3A / 4A) for a PhD-led
										<strong>CNN quality-control model</strong>: a FLIR Blackfly camera with dual
										synchronized LEDs in a controlled dark enclosure, capturing three exposures per
										sample (each light independently, then combined) to characterize the specular
										figure of high-grade wood; fixtures 3D-printed in PLA+.
									</li>
									<li>
										Wrote <strong>Python capture software</strong> that triggers synchronized lighting
										and acquisition from a single keypress and assembled a labeled dataset of roughly
										1,200 samples (about 3,600 images) across three grades.
									</li>
									<li>
										Designing a <strong>handheld field device</strong> integrating the lighting, camera,
										and trained model for in-the-wild grade testing by Gibson wood suppliers (July 2026).
									</li>
									<li>
										Designed an automated <strong>4-camera gantry</strong> spanning roughly 2.4 m of
										travel for cuboidal-log imaging: a 3030-aluminum square fixture with four
										independently positionable FLIR Blackfly cameras plus whole-gantry travel,
										driven by NEMA 17 steppers through planetary and cycloidal (27:1) reducers sized
										for ample torque margin, with lead-screw motion on all axes, controlled by an
										Arduino running
										<strong>GRBL</strong>.
									</li>
									<li>
										Provisioned an <strong>NVIDIA Jetson Orin Nano</strong> (Linux and ML toolchain)
										for edge wood-chip moisture detection and annotated a 7,000-image training dataset;
										designed an active-cooled, dust-resistant enclosure (heatsink and fan) to hold the
										board below 50&deg;C in-mill.
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
									Department of Plant and Soil Sciences, Mississippi State University &bull;
									Starkville, MS
								</p>
								<ul class="mt-3 list-outside list-disc space-y-2 pl-5 text-base text-gray-800">
									<li>
										Designed and <strong>3D-printed</strong> an automated vibratory seed-feeder that
										singulates seeds and streams them into a camera's field of view for hands-free, repeatable
										imaging.
									</li>
									<li>
										Built an <strong>ArUco-calibrated vision station</strong> using marker-based homography
										to correct camera perspective distortion and constrain the region of interest, feeding
										an ML model that counts seeds and extracts per-seed metrics (area, length, width);
										processed roughly 200 seeds per 5-second capture with no fixed object-count limit,
										populating a research seed-trait database.
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
									<p class="text-lg text-gray-700 italic">
										Mississippi State University &bull; Junior
									</p>
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
									<h4 class="text-xl font-bold text-black">
										Cambridge International Advanced Levels
									</h4>
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
		</div>
	</div>
{/if}

<style>
	/* ===== Written intro ===== */
	.intro {
		background: #fff;
		padding: 6rem 1.5rem 7rem;
		border-top: 1px solid #f1f1f1;
	}

	.intro-inner {
		max-width: 46rem;
		margin: 0 auto;
	}

	.intro-heading {
		font-family: 'Noto Serif', serif;
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: #111;
		margin: 0 0 2rem;
	}

	.intro-lead {
		font-size: 1.25rem;
		line-height: 1.7;
		color: #374151;
		margin: 0 0 1.5rem;
	}

	.intro-body {
		font-size: 1.0625rem;
		line-height: 1.8;
		color: #4b5563;
		margin: 0 0 2.5rem;
	}

	.intro-lead strong,
	.intro-body strong {
		color: #111;
		font-weight: 600;
	}

	.focus-list {
		list-style: none;
		padding: 0;
		margin: 0 0 3rem;
		display: grid;
		gap: 0.75rem;
	}

	.focus-list li {
		font-size: 0.9375rem;
		color: #4b5563;
		padding-left: 1.25rem;
		position: relative;
	}

	.focus-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.6em;
		width: 6px;
		height: 6px;
		background: #111;
		border-radius: 50%;
	}

	.intro-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding-top: 2rem;
		border-top: 1px solid #f1f1f1;
	}

	.intro-links a {
		font-family: 'Noto Serif', serif;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: #6b7280;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.intro-links a:hover {
		color: #000;
	}

	/* Prime-style panel: pure CSS entry animations */
	.overlay-backdrop {
		background: rgba(0, 0, 0, 0.6);
		animation: overlay-fade 0.2s ease-out;
	}

	@media (min-width: 768px) {
		.overlay-backdrop {
			backdrop-filter: blur(4px);
		}
	}

	.overlay-panel {
		animation: panel-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes overlay-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes panel-pop {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.overlay-backdrop,
		.overlay-panel {
			animation: none;
		}
	}

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
