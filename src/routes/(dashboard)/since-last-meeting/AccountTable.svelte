<script lang="ts">
	import { useDashboardViewportState } from '$lib/dashboard/layout/viewport.svelte';
	import type { SinceLastMeetingPageData } from '$lib/dashboard/page-models/sinceLastMeeting';
	import DesktopTable from './DesktopTable.svelte';
	import MobileTable from './MobileTable.svelte';

	type AccountRow = SinceLastMeetingPageData['accounts'][number];

	type Props = {
		rows: readonly AccountRow[];
	};

	let { rows }: Props = $props();
	const viewport = useDashboardViewportState();
</script>

{#if viewport.desktop.current}
	<DesktopTable {rows} />
{:else}
	<MobileTable {rows} />
{/if}
