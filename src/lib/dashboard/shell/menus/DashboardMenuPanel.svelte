<script lang="ts">
	import type { Snippet } from 'svelte';
	import DashboardMenuSurface from './DashboardMenuSurface.svelte';

	type Props = {
		panelId: string;
		class: string;
		title: string;
		body?: Snippet;
	};

	let { panelId, class: classProp, title, body }: Props = $props();
</script>

<DashboardMenuSurface {panelId} class={classProp}>
	<div class="w-full rounded-md border border-zinc-100 bg-white p-1 shadow-sm">
		<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
			{title}
		</p>

		{#if body}
			{@render body()}
		{/if}
	</div>
</DashboardMenuSurface>
