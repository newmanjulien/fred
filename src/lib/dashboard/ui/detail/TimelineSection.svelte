<script lang="ts">
	import type { TimelineItem } from '$lib/dashboard/view-models/account-content';
	import TimelineRow from './TimelineRow.svelte';

	type Props = {
		items: readonly TimelineItem[];
	};

	let { items }: Props = $props();
</script>

<ol class="pt-1">
	{#each items as item, index (item.id)}
		<TimelineRow {item} showConnector={index !== items.length - 1} />
	{/each}
</ol>
