<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		panelId: string;
		class?: string;
		children?: Snippet;
	};

	let { panelId, class: classProp = '', children }: Props = $props();
</script>

<div id={panelId} role="menu" aria-orientation="vertical" class={classProp}>
	{#if children}
		{@render children()}
	{/if}
</div>
