<script lang="ts">
	import type { Snippet } from 'svelte';
	import DashboardMenuSurface from './DashboardMenuSurface.svelte';

	type Props = {
		panelId: string;
		class?: string;
		children?: Snippet;
	};

	let { panelId, class: classProp = '', children }: Props = $props();
</script>

<DashboardMenuSurface {panelId} class={classProp}>
	{#if children}
		{@render children()}
	{/if}
</DashboardMenuSurface>
