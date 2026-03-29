<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatIsoDateTimeRelative } from '$lib/format/date-time';
	import { isInternalDashboardLink } from '$lib/dashboard/links';
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import PersonInline from '$lib/dashboard/ui/people/PersonInline.svelte';
	import DashboardDesktopTableFrame from '$lib/dashboard/ui/table/DashboardDesktopTableFrame.svelte';
	import { getProbabilityLabel } from '$lib/dashboard/view-models/account';
	import { cn } from '$lib/support/cn';
	import {
		LEADERSHIP_TABLE_COLUMN_CLASS,
		LEADERSHIP_TABLE_COLUMN_CLASS_WITH_SELECTION,
		LEADERSHIP_TABLE_HEADERS,
		LEADERSHIP_TABLE_MIN_WIDTH_CLASS,
		LEADERSHIP_TABLE_MIN_WIDTH_CLASS_WITH_SELECTION
	} from './table-layout';

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
		selection?: LeadershipTableSelection;
		ariaLabel?: string;
		infoText?: string | null;
	};

	let {
		rows,
		selection,
		ariaLabel = 'Leadership accounts table',
		infoText
	}: Props = $props();

	const headers = LEADERSHIP_TABLE_HEADERS;
	let columnClass = $derived(
		selection ? LEADERSHIP_TABLE_COLUMN_CLASS_WITH_SELECTION : LEADERSHIP_TABLE_COLUMN_CLASS
	);
	let minWidthClass = $derived(
		selection
			? LEADERSHIP_TABLE_MIN_WIDTH_CLASS_WITH_SELECTION
			: LEADERSHIP_TABLE_MIN_WIDTH_CLASS
	);

	function toLeadershipRows(value: readonly unknown[]) {
		return value as readonly LeadershipTableRow[];
	}

	function getVisibleSelectableRowKeys(visibleRows: readonly LeadershipTableRow[]) {
		return visibleRows.map((row) => row.key);
	}

	function areAllVisibleRowsSelected(visibleRows: readonly LeadershipTableRow[]) {
		return (
			visibleRows.length > 0 &&
			visibleRows.every((row) => selection?.selectedRowKeys.has(row.key))
		);
	}

	function areSomeVisibleRowsSelected(visibleRows: readonly LeadershipTableRow[]) {
		return visibleRows.some((row) => selection?.selectedRowKeys.has(row.key));
	}

	function getLastActivityText(row: LeadershipTableRow) {
		return row.lastActivity.kind === 'relative'
			? formatIsoDateTimeRelative(row.lastActivity.atIso)
			: row.lastActivity.label;
	}

	function getProbabilityText(row: LeadershipTableRow) {
		return `${row.probability}% ${getProbabilityLabel(row.isRenewal)}`;
	}
</script>

{#snippet selectionCell(row: LeadershipTableRow)}
	{#if selection}
		<label
			data-table-cell
			data-table-select-cell
			class="cursor-pointer items-center justify-center"
		>
			<input
				data-selection-checkbox
				type="checkbox"
				aria-label={`Select ${row.account}`}
				class="h-3.5 w-3.5 rounded-[3px]"
				checked={selection.selectedRowKeys.has(row.key)}
				onchange={(event) =>
					selection.onToggleRow(row.key, (event.currentTarget as HTMLInputElement).checked)}
			/>
		</label>
	{/if}
{/snippet}

{#snippet accountCellContent(row: LeadershipTableRow, isLinked: boolean)}
	<span
		data-table-cell
		class={`font-medium text-zinc-600${isLinked ? ' transition-colors group-hover:text-zinc-900' : ''}`}
	>
		{row.account}
	</span>
	<span data-table-cell class="whitespace-nowrap">
		<ActivityLevelLabel activityLevel={row.activityLevel} />
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-900">
		{getProbabilityText(row)}
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-600">
		{#if row.owner}
			<PersonInline person={row.owner} />
		{:else}
			Unassigned
		{/if}
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-600">
		{row.stage}
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-500">
		{getLastActivityText(row)}
	</span>
{/snippet}

<DashboardDesktopTableFrame
	class="pt-1"
	{headers}
	{columnClass}
	{minWidthClass}
	{ariaLabel}
	rows={rows}
	infoText={infoText}
	dataAttribute="data-leadership-table-info-bar"
	interactiveRows={false}
>
	{#snippet headerLeading(visibleRows)}
		{@const pageRows = toLeadershipRows(visibleRows)}
		{#if selection}
			<label
				data-table-header-cell
				data-table-select-header
				class="flex items-center justify-center"
			>
				<input
					data-selection-checkbox
					type="checkbox"
					aria-label="Select visible rows"
					class="h-3.5 w-3.5 rounded-[3px]"
					checked={areAllVisibleRowsSelected(pageRows)}
					indeterminate={areSomeVisibleRowsSelected(pageRows) && !areAllVisibleRowsSelected(pageRows)}
					onchange={(event) =>
						selection.onToggleAllRows(
							getVisibleSelectableRowKeys(pageRows),
							(event.currentTarget as HTMLInputElement).checked
						)}
				/>
			</label>
		{/if}
	{/snippet}

	{#snippet body(visibleRows)}
		{@const pageRows = toLeadershipRows(visibleRows)}
		<div class="divide-y divide-zinc-100">
			{#each pageRows as row (row.key)}
				{@const internalNavigation =
					isInternalDashboardLink(row.navigation) ? row.navigation : null}
				{#if selection && internalNavigation}
					<div
						data-table-row
						class={cn(columnClass, 'group bg-white transition-colors hover:bg-zinc-50/80')}
					>
						{@render selectionCell(row)}
						<a
							href={resolve(internalNavigation.href)}
							data-table-cell
							class="cursor-pointer font-medium text-zinc-600 transition-colors group-hover:text-zinc-900 no-underline"
						>
							{row.account}
						</a>
						<a
							href={resolve(internalNavigation.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap no-underline"
						>
							<ActivityLevelLabel activityLevel={row.activityLevel} />
						</a>
						<a
							href={resolve(internalNavigation.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap text-zinc-900 no-underline"
						>
							{getProbabilityText(row)}
						</a>
						<a
							href={resolve(internalNavigation.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap text-zinc-600 no-underline"
						>
							{#if row.owner}
								<PersonInline person={row.owner} />
							{:else}
								Unassigned
							{/if}
						</a>
						<a
							href={resolve(internalNavigation.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap text-zinc-600 no-underline"
						>
							{row.stage}
						</a>
						<a
							href={resolve(internalNavigation.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap text-zinc-500 no-underline"
						>
							{getLastActivityText(row)}
						</a>
					</div>
				{:else if !selection && internalNavigation}
					<a
						href={resolve(internalNavigation.href)}
						data-table-row
						class={cn(columnClass, 'group no-underline transition-colors hover:bg-zinc-50/80')}
					>
						{@render accountCellContent(row, true)}
					</a>
				{:else}
					<div data-table-row class={columnClass}>
						{@render selectionCell(row)}
						{@render accountCellContent(row, false)}
					</div>
				{/if}
			{/each}
		</div>
	{/snippet}
</DashboardDesktopTableFrame>
