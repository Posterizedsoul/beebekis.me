<script lang="ts">
	import { auth } from '$lib/firebase';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// No pre-filled credentials for security
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) {
				goto('/admin');
			}
		});
		return unsubscribe;
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (err: any) {
			console.error(err);
			// Handle known error codes
			if (
				err.code === 'auth/invalid-credential' ||
				err.code === 'auth/wrong-password' ||
				err.code === 'auth/user-not-found'
			) {
				error = 'Invalid email or password.';
			} else if (err.code === 'auth/configuration-not-found') {
				error =
					'Firebase Auth not configured correctly. IMPORTANT: You must enable "Email/Password" provider in the Firebase Console.';
			} else if (err.code === 'auth/too-many-requests') {
				error = 'Too many failed attempts. Please try again later.';
			} else {
				error = 'Failed to authenticate. ' + err.message;
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
			<p class="mt-2 text-center text-sm text-gray-600">Sign in to manage your portfolio content</p>
		</div>
		<form class="mt-8 space-y-6" onsubmit={handleLogin} autocomplete="off">
			<div class="-space-y-px rounded-md shadow-sm">
				<div>
					<label for="email-address" class="sr-only">Email address</label>
					<input
						id="email-address"
						name="email"
						type="email"
						autocomplete="off"
						required
						class="relative block w-full appearance-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:ring-black focus:outline-none sm:text-sm"
						placeholder="Email address"
						bind:value={email}
						disabled={loading}
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="off"
						required
						class="relative block w-full appearance-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:ring-black focus:outline-none sm:text-sm"
						placeholder="Password"
						bind:value={password}
						disabled={loading}
					/>
				</div>
			</div>

			{#if error}
				<div class="rounded-md bg-red-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg
								class="h-5 w-5 text-red-400"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">{error}</h3>
						</div>
					</div>
				</div>
			{/if}

			<div>
				<button
					type="submit"
					disabled={loading}
					class="group relative flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if loading}
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								class="h-5 w-5 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						</span>
						Signing in...
					{:else}
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								class="h-5 w-5 text-gray-500 group-hover:text-gray-400"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
						Sign in
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
