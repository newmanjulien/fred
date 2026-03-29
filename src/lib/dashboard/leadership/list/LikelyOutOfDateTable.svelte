<script lang="ts">
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import Table from './Table.svelte';

	type LeadershipTableRow =
		| NewBusinessListPageData['rows'][number]
		| RenewalsListPageData['rows'][number];

	type LeadershipTableSelection = {
		selectedRowKeys: ReadonlySet<LeadershipTableRow['key']>;
		onToggleRow: (rowKey: LeadershipTableRow['key'], checked: boolean) => void;
		onToggleAllRows: (rowKeys: readonly LeadershipTableRow['key'][], checked: boolean) => void;
	};

	type Props = {
		rows: readonly LeadershipTableRow[];
		selection: LeadershipTableSelection;
		ariaLabel?: string;
		infoText?: string | null;
	};

	let {
		rows,
		selection,
		ariaLabel = 'Leadership likely out of date accounts table',
		infoText
	}: Props = $props();
</script>

<Table {rows} {selection} {ariaLabel} {infoText} />
