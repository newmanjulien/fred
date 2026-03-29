<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import Table from './Table.svelte';
	import {
		getLikelyOutOfDateHeaderUiScope,
		getStaleLikelyOutOfDateSelectionRowKeys,
		LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID
	} from './likely-out-of-date';

	type LeadershipTableRow =
		| NewBusinessListPageData['rows'][number]
		| RenewalsListPageData['rows'][number];

	type Props = {
		rows: readonly LeadershipTableRow[];
		ariaLabel?: string;
		probabilityLabel?: string;
	};

	let {
		rows,
		ariaLabel = 'Leadership likely out of date accounts table',
		probabilityLabel = 'likely to close'
	}: Props = $props();
	let selectedRowKeys = new SvelteSet<LeadershipTableRow['key']>();
	const selection = {
		headerLabel: 'Select' as const,
		selectedRowKeys,
		onToggleRow: toggleSelectedRow
	};

	$effect(() => {
		const staleRowKeys = getStaleLikelyOutOfDateSelectionRowKeys(selectedRowKeys, rows);

		for (const rowKey of staleRowKeys) {
			selectedRowKeys.delete(rowKey);
		}
	});

	function toggleSelectedRow(rowKey: LeadershipTableRow['key'], checked: boolean) {
		if (checked) {
			selectedRowKeys.add(rowKey);
		} else {
			selectedRowKeys.delete(rowKey);
		}
	}
</script>

<DashboardHeaderScope
	scopeId={LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID}
	scope={getLikelyOutOfDateHeaderUiScope(selectedRowKeys.size)}
/>

<Table {rows} {selection} {ariaLabel} {probabilityLabel} />
