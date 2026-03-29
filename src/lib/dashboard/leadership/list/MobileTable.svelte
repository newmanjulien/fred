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
	import DashboardMobileTableFrame from '$lib/dashboard/ui/table/DashboardMobileTableFrame.svelte';
	import { getProbabilityLabel } from '$lib/dashboard/view-models/account';
	import { cn } from '$lib/support/cn';
	import {
		LEADERSHIP_TABLE_COLUMN_CLASS,
		LEADERSHIP_TABLE_HEADERS,
		LEADERSHIP_TABLE_MIN_WIDTH_CLASS
	} from './table-layout';

	type LeadershipTableRow =
		| NewBusinessListPageData['rows'][number]
		| RenewalsListPageData['rows'][number];

	type Props = {
		rows: readonly LeadershipTableRow[];
		ariaLabel?: string;
		infoText?: string | null;
	};

	let {
		rows,
		ariaLabel = 'Leadership accounts table',
		infoText
	}: Props = $props();

	const headers = LEADERSHIP_TABLE_HEADERS;

	function toLeadershipRows(value: readonly unknown[]) {
		return value as readonly LeadershipTableRow[];
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

<DashboardMobileTableFrame
	class="pt-1"
	headers={headers}
	columnClass={LEADERSHIP_TABLE_COLUMN_CLASS}
	minWidthClass={LEADERSHIP_TABLE_MIN_WIDTH_CLASS}
	{ariaLabel}
	rows={rows}
	infoText={infoText}
	dataAttribute="data-leadership-table-info-bar"
	interactiveRows={false}
>
	{#snippet body(visibleRows)}
		{@const pageRows = toLeadershipRows(visibleRows)}
		<div class="divide-y divide-zinc-100">
			{#each pageRows as row (row.key)}
				{@const internalNavigation =
					isInternalDashboardLink(row.navigation) ? row.navigation : null}
				{#if internalNavigation}
					<a
						href={resolve(internalNavigation.href)}
						data-table-row
						class={cn(
							LEADERSHIP_TABLE_COLUMN_CLASS,
							'group no-underline transition-colors hover:bg-zinc-50/80'
						)}
					>
						{@render accountCellContent(row, true)}
					</a>
				{:else}
					<div data-table-row class={LEADERSHIP_TABLE_COLUMN_CLASS}>
						{@render accountCellContent(row, false)}
					</div>
				{/if}
			{/each}
		</div>
	{/snippet}
</DashboardMobileTableFrame>
