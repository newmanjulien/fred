<script lang="ts">
	import { useDashboardViewportState } from '$lib/dashboard/layout/viewport.svelte';
	import type { MyAccountsListPageData } from '$lib/dashboard/page-models/myAccounts';
	import type { BrokerKey } from '$lib/types/keys';
	import DesktopTable from './DesktopTable.svelte';
	import MobileTable from './MobileTable.svelte';

	type MyAccountsTableRow = MyAccountsListPageData['rows'][number];

	type Props = {
		rows: readonly MyAccountsTableRow[];
		activeBrokerKey: BrokerKey;
	};

	let { rows, activeBrokerKey }: Props = $props();
	const viewport = useDashboardViewportState();
</script>

{#if viewport.desktop.current}
	<DesktopTable {rows} {activeBrokerKey} />
{:else}
	<MobileTable {rows} {activeBrokerKey} />
{/if}
