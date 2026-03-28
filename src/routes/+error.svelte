<script lang="ts">
	import { page } from '$app/state';
	import { CONVEX_UNAVAILABLE_ERROR_CODE } from '$lib/convex/errors';

	const isConvexUnavailable = $derived(
		page.status === 503 && page.error?.code === CONVEX_UNAVAILABLE_ERROR_CODE
	);
	const title = $derived(
		isConvexUnavailable ? 'Convex backend unavailable' : 'Request failed'
	);
</script>

<svelte:head>
	<title>{page.status} | Overbase</title>
</svelte:head>

<div
	class="min-h-screen bg-[radial-gradient(circle_at_top,_rgb(255_255_255),_rgb(240_240_239)_55%,_rgb(228_228_226))] text-zinc-950"
>
	<div class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16 sm:px-10">
		<p class="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
			{page.status}
		</p>
		<h1 class="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
		<p class="mt-6 max-w-2xl text-base leading-7 text-zinc-600">
			{page.error?.message ?? 'An unexpected server error interrupted the request.'}
		</p>

		{#if isConvexUnavailable}
			<div class="mt-8 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur">
				<p class="text-sm font-semibold text-zinc-900">Runtime contract</p>
				<p class="mt-3 text-sm leading-6 text-zinc-600">
					This app renders dashboard data on the server and requires a reachable Convex
					deployment. Local development should be started with
					<code class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.8125rem] text-zinc-900">
						npm run dev
					</code>,
					which boots Convex and Vite together.
				</p>
				<p class="mt-3 text-sm leading-6 text-zinc-600">
					Preview, CI, and production also need a valid
					<code class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.8125rem] text-zinc-900">
						PUBLIC_CONVEX_URL
					</code>
					server environment variable that points at a reachable backend.
				</p>
			</div>
		{/if}
	</div>
</div>
