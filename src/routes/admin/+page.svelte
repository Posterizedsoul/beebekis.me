<script lang="ts">
	import { auth } from '$lib/firebase';

	let userEmail = $derived(auth.currentUser?.email || 'Admin');

	const sections = [
		{ href: '/admin/memories', title: 'Memories', description: 'Manage photo albums' },
		{ href: '/admin/diary', title: 'Diary', description: 'Write daily journals' },
		{ href: '/admin/blog', title: 'Blog', description: 'Publish articles' },
		{ href: '/admin/projects', title: 'Projects', description: 'Showcase your work' }
	];
</script>

<div class="space-y-10">
	<div>
		<h2 class="font-serif text-3xl font-bold tracking-wide text-black uppercase sm:text-4xl">
			Dashboard
		</h2>
		<p class="mt-2 text-sm text-gray-500">
			Welcome back, {userEmail}. Manage your portfolio content from here.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each sections as section (section.href)}
			<a
				href={section.href}
				class="group rounded-sm border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-black hover:shadow-md"
			>
				<h3 class="font-serif text-xl font-bold text-black">
					{section.title}
				</h3>
				<p class="mt-1 text-sm text-gray-500">{section.description}</p>
				<span
					class="mt-4 inline-block text-sm font-medium text-gray-400 transition-colors group-hover:text-black"
				>
					Manage →
				</span>
			</a>
		{/each}
	</div>
</div>
