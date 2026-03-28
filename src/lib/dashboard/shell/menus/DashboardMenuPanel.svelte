<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		panelId: string;
		class: string;
		title: string;
		body?: Snippet;
	};

	let { panelId, class: classProp, title, body }: Props = $props();
</script>

<div id={panelId} role="menu" aria-orientation="vertical" class={classProp}>
	<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
		{title}
	</p>

	{#if body}
		{@render body()}
	{/if}
</div>
