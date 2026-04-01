<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatUsdAmount } from '$lib/format/number';
	import { isInternalDashboardLink } from '$lib/dashboard/links';
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import PersonInline from '$lib/dashboard/ui/people/PersonInline.svelte';
	import RenewalDateLabel from '$lib/dashboard/ui/shared/RenewalDateLabel.svelte';
	import DashboardMobileTableFrame from '$lib/dashboard/ui/table/DashboardMobileTableFrame.svelte';
	import { getProbabilityLabel } from '$lib/dashboard/view-models/account';
	import { cn } from '$lib/support/cn';
	import {
		LEADERSHIP_TABLE_COLUMN_CLASS,
		LEADERSHIP_TABLE_HEADERS,
		RENEWALS_TABLE_HEADERS,
		RENEWALS_TABLE_COLUMN_CLASS,
		LEADERSHIP_TABLE_MIN_WIDTH_CLASS,
		RENEWALS_TABLE_MIN_WIDTH_CLASS
	} from './table-layout';
	import LastActivityCell from './LastActivityCell.svelte';
	import LeadershipTableFooter from './LeadershipTableFooter.svelte';

	type LeadershipTableRow =
		| NewBusinessListPageData['rows'][number]
		| RenewalsListPageData['rows'][number];
	type LeadershipPageKind = NewBusinessListPageData['route']['kind'] | RenewalsListPageData['route']['kind'];

	type Props = {
		pageKind: LeadershipPageKind;
		rows: readonly LeadershipTableRow[];
		ariaLabel?: string;
		defaultFooterText?: string | null;
	};

	let {
		pageKind,
		rows,
		ariaLabel = 'Leadership accounts table',
		defaultFooterText
	}: Props = $props();

	let isRenewalsPage = $derived(pageKind === 'renewals-list');
	let headers = $derived(isRenewalsPage ? RENEWALS_TABLE_HEADERS : LEADERSHIP_TABLE_HEADERS);
	let columnClass = $derived(
		isRenewalsPage ? RENEWALS_TABLE_COLUMN_CLASS : LEADERSHIP_TABLE_COLUMN_CLASS
	);
	let minWidthClass = $derived(
		isRenewalsPage ? RENEWALS_TABLE_MIN_WIDTH_CLASS : LEADERSHIP_TABLE_MIN_WIDTH_CLASS
	);

	function toLeadershipRows(value: readonly unknown[]) {
		return value as readonly LeadershipTableRow[];
	}

	function getProbabilityText(row: LeadershipTableRow) {
		return `${row.probability}% ${getProbabilityLabel(row.kind)}`;
	}

	function getStageText(row: LeadershipTableRow) {
		return row.stage ?? 'No stage';
	}

	function getRevenueText(row: LeadershipTableRow) {
		return row.revenue == null ? 'No revenue' : formatUsdAmount(row.revenue);
	}
</script>

{#snippet ownerCellContent(row: LeadershipTableRow)}
	{#if row.owner}
		<PersonInline person={row.owner} />
	{:else}
		Unassigned
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
	{#if isRenewalsPage}
		<span data-table-cell class="whitespace-nowrap text-zinc-600">
			{@render ownerCellContent(row)}
		</span>
		<span data-table-cell class="whitespace-nowrap text-zinc-600">{getRevenueText(row)}</span>
		<span data-table-cell class="whitespace-nowrap text-zinc-500">
			<RenewalDateLabel renewalDate={row.renewalDate} />
		</span>
		<span data-table-cell class="whitespace-nowrap text-zinc-500">
			<LastActivityCell lastActivity={row.lastActivity} />
		</span>
	{:else}
		<span data-table-cell class="whitespace-nowrap text-zinc-900">
			{getProbabilityText(row)}
		</span>
		<span data-table-cell class="whitespace-nowrap text-zinc-600">
			{@render ownerCellContent(row)}
		</span>
		<span data-table-cell class="whitespace-nowrap text-zinc-600">{getStageText(row)}</span>
		<span data-table-cell class="whitespace-nowrap text-zinc-500">
			<LastActivityCell lastActivity={row.lastActivity} />
		</span>
	{/if}
{/snippet}

<DashboardMobileTableFrame
	class="pt-1"
	headers={headers}
	columnClass={columnClass}
	minWidthClass={minWidthClass}
	{ariaLabel}
	rows={rows}
	dataAttribute="data-leadership-table-info-bar"
	interactiveRows={false}
>
	{#snippet footer(visibleRows)}
		<LeadershipTableFooter
			defaultText={defaultFooterText}
			visibleRows={toLeadershipRows(visibleRows)}
		/>
	{/snippet}

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
						class={cn(columnClass, 'group no-underline transition-colors hover:bg-zinc-50/80')}
					>
						{@render accountCellContent(row, true)}
					</a>
				{:else}
					<div data-table-row class={columnClass}>
						{@render accountCellContent(row, false)}
					</div>
				{/if}
			{/each}
		</div>
	{/snippet}
</DashboardMobileTableFrame>
