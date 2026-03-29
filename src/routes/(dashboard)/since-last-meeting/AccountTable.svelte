<script lang="ts">
	import { resolve } from '$app/paths';
	import { isInternalDashboardLink } from '$lib/dashboard/links';
	import type { SinceLastMeetingPageData } from '$lib/dashboard/page-models/sinceLastMeeting';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import DashboardResponsiveTable from '$lib/dashboard/ui/shared/DashboardResponsiveTable.svelte';
	import { getProbabilityLabel } from '$lib/dashboard/view-models/account';
	import { cn } from '$lib/support/cn';

	type AccountRow = SinceLastMeetingPageData['accounts'][number];

	type Props = {
		rows: readonly AccountRow[];
	};

	const INFO_TEXT = 'Accounts with updates since your last meeting with Julien.';

	let { rows }: Props = $props();

	const headers = ['Account', 'Activity level', 'Probability', 'Stage'] as const;
	const columnClass =
		'grid-cols-[minmax(9.5rem,1.2fr)_minmax(7.5rem,0.8fr)_minmax(7.5rem,0.8fr)_minmax(5.5rem,0.5fr)] md:grid-cols-[minmax(10rem,1.3fr)_minmax(7.5rem,0.8fr)_minmax(7.5rem,0.8fr)_minmax(5.5rem,0.5fr)]';
	const minWidthClass = 'min-w-[40rem] md:min-w-full';

	function toAccountRows(value: readonly unknown[]) {
		return value as readonly AccountRow[];
	}

	function getProbabilityText(row: AccountRow) {
		return `${row.probability}% ${getProbabilityLabel(row.isRenewal)}`;
	}
</script>

{#snippet rowCells(row: AccountRow, isLinked: boolean)}
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
		{row.stage}
	</span>
{/snippet}

<DashboardResponsiveTable
	class="pt-1"
	{headers}
	{columnClass}
	{minWidthClass}
	ariaLabel="Account summary table"
	rows={rows}
	infoText={INFO_TEXT}
	dataAttribute="data-since-last-meeting-accounts-info-bar"
	interactiveRows={rows.some((row) => isInternalDashboardLink(row.navigation))}
>
	{#snippet body(visibleRows)}
		{@const pageRows = toAccountRows(visibleRows)}
		<div class="divide-y divide-zinc-100">
			{#each pageRows as row (row.key)}
				{@const internalNavigation =
					isInternalDashboardLink(row.navigation) ? row.navigation : null}
				{#if internalNavigation}
					<a
						href={resolve(internalNavigation.href)}
						data-table-row
						class={cn(columnClass, 'group no-underline')}
					>
						{@render rowCells(row, true)}
					</a>
				{:else}
					<div data-table-row class={columnClass}>
						{@render rowCells(row, false)}
					</div>
				{/if}
			{/each}
		</div>
	{/snippet}

</DashboardResponsiveTable>
