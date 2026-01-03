<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, getDocs, query, orderBy } from 'firebase/firestore';
	import { onMount } from 'svelte';

	interface BlogPost {
		id: string;
		title: string;
		date: Date;
		slug: string;
		isPublished: boolean;
	}

	let posts: BlogPost[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const q = query(collection(db, 'blog_posts'), orderBy('date', 'desc'));
			const querySnapshot = await getDocs(q);

			posts = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					title: data.title,
					date: data.date?.toDate() || new Date(),
					slug: data.slug,
					isPublished: data.isPublished || false
				};
			});
		} catch (err) {
			console.error('Error fetching blog posts:', err);
		} finally {
			loading = false;
		}
	});
</script>

<div class="sm:flex sm:items-center">
	<div class="sm:flex-auto">
		<h1 class="text-2xl font-semibold text-gray-900">Blog Posts</h1>
		<p class="mt-2 text-sm text-gray-700">Manage your blog articles and publications.</p>
	</div>
	<div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
		<a
			href="/admin/blog/new"
			class="block rounded-md bg-black px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
		>
			Write Article
		</a>
	</div>
</div>

<div class="mt-8 flex flex-col">
	<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
		<div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
			<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
				<table class="min-w-full divide-y divide-gray-300">
					<thead class="bg-gray-50">
						<tr>
							<th
								scope="col"
								class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
								>Title</th
							>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
								>Date</th
							>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
								>Status</th
							>
							<th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
								<span class="sr-only">Edit</span>
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#if loading}
							<tr>
								<td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500"
									>Loading articles...</td
								>
							</tr>
						{:else if posts.length === 0}
							<tr>
								<td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500"
									>No blog posts found. Write one!</td
								>
							</tr>
						{:else}
							{#each posts as post}
								<tr>
									<td
										class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
									>
										<a
											href="/blog/{post.slug}"
											target="_blank"
											class="hover:text-indigo-600 hover:underline">{post.title}</a
										>
									</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
										>{post.date.toLocaleDateString()}</td
									>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
										{#if post.isPublished}
											<span
												class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
												>Published</span
											>
										{:else}
											<span
												class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
												>Draft</span
											>
										{/if}
									</td>
									<td
										class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
									>
										<a href="/admin/blog/{post.id}" class="text-indigo-600 hover:text-indigo-900"
											>Edit<span class="sr-only">, {post.title}</span></a
										>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
