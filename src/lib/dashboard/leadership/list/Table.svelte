<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatIsoDateTimeRelative } from '$lib/format/date-time';
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import PersonInline from '$lib/dashboard/ui/people/PersonInline.svelte';
	import DashboardTableShell from '$lib/dashboard/ui/shared/DashboardTableShell.svelte';
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
		probabilityLabel?: string;
	};

	let {
		rows,
		selection,
		ariaLabel = 'Leadership accounts table',
		probabilityLabel = 'likely to close'
	}: Props = $props();

	const headers = LEADERSHIP_TABLE_HEADERS;
	let selectAllCheckbox = $state<HTMLInputElement | null>(null);
	const selectableRowKeys = $derived(rows.map((row) => row.key));
	const allRowsSelected = $derived(
		selectableRowKeys.length > 0 &&
			selectableRowKeys.every((rowKey) => selection?.selectedRowKeys.has(rowKey))
	);
	const someRowsSelected = $derived(
		selectableRowKeys.some((rowKey) => selection?.selectedRowKeys.has(rowKey))
	);
	let columnClass = $derived(
		selection ? LEADERSHIP_TABLE_COLUMN_CLASS_WITH_SELECTION : LEADERSHIP_TABLE_COLUMN_CLASS
	);
	let minWidthClass = $derived(
		selection
			? LEADERSHIP_TABLE_MIN_WIDTH_CLASS_WITH_SELECTION
			: LEADERSHIP_TABLE_MIN_WIDTH_CLASS
	);

	$effect(() => {
		if (selectAllCheckbox) {
			selectAllCheckbox.indeterminate = someRowsSelected && !allRowsSelected;
		}
	});
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
		class={`font-medium text-zinc-600${
			isLinked ? ' transition-colors group-hover:text-zinc-900' : ''
		}`}
	>
		{row.account}
	</span>
	<span data-table-cell class="whitespace-nowrap">
		<ActivityLevelLabel activityLevel={row.activityLevel} />
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-900">
		{row.probability}% {probabilityLabel}
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
		{#if row.lastActivity.kind === 'relative'}
			{formatIsoDateTimeRelative(row.lastActivity.atIso)}
		{:else}
			{row.lastActivity.label}
		{/if}
	</span>
{/snippet}

<DashboardTableShell
	{headers}
	{columnClass}
	{minWidthClass}
	{ariaLabel}
	rowsLength={rows.length}
	interactiveRows={false}
>
	{#snippet headerLeading()}
		{#if selection}
			<label
				data-table-header-cell
				data-table-select-header
				class="flex items-center justify-center"
			>
				<input
					bind:this={selectAllCheckbox}
					data-selection-checkbox
					type="checkbox"
					aria-label="Select all rows"
					class="h-3.5 w-3.5 rounded-[3px]"
					checked={allRowsSelected}
					onchange={(event) =>
						selection.onToggleAllRows(
							selectableRowKeys,
							(event.currentTarget as HTMLInputElement).checked
						)}
				/>
			</label>
		{/if}
	{/snippet}

	{#snippet body()}
		<div class="divide-y divide-zinc-100">
			{#each rows as row (row.key)}
					{#if selection && row.href}
						<div
							data-table-row
							class={cn(columnClass, 'group bg-white transition-colors hover:bg-zinc-50/80')}
						>
						{@render selectionCell(row)}
						<a
							href={resolve(row.href)}
							data-table-cell
							class="cursor-pointer font-medium text-zinc-600 transition-colors group-hover:text-zinc-900 no-underline"
						>
							{row.account}
						</a>
						<a
							href={resolve(row.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap no-underline"
						>
							<ActivityLevelLabel activityLevel={row.activityLevel} />
						</a>
						<a
							href={resolve(row.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap text-zinc-900 no-underline"
						>
							{row.probability}% {probabilityLabel}
						</a>
						<a
							href={resolve(row.href)}
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
							href={resolve(row.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap text-zinc-600 no-underline"
						>
							{row.stage}
						</a>
						<a
							href={resolve(row.href)}
							data-table-cell
							class="cursor-pointer whitespace-nowrap text-zinc-500 no-underline"
						>
							{#if row.lastActivity.kind === 'relative'}
								{formatIsoDateTimeRelative(row.lastActivity.atIso)}
							{:else}
								{row.lastActivity.label}
							{/if}
						</a>
					</div>
					{:else if !selection && row.href}
						<a
							href={resolve(row.href)}
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
</DashboardTableShell>
