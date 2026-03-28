<script lang="ts">
	import { resolve } from '$app/paths';
	import type { SinceLastMeetingPageData } from '$lib/dashboard/page-models/sinceLastMeeting';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import DashboardTableShell from '$lib/dashboard/ui/shared/DashboardTableShell.svelte';
	import { cn } from '$lib/support/cn';

	type AccountRow = SinceLastMeetingPageData['accounts'][number];

	type Props = {
		rows: readonly AccountRow[];
	};

	let { rows }: Props = $props();

	const headers = ['Account', 'Activity level', 'Probability', 'Stage'] as const;
	const columnClass =
		'grid-cols-[minmax(9.5rem,1.2fr)_minmax(7.5rem,0.8fr)_minmax(7.5rem,0.8fr)_minmax(5.5rem,0.5fr)] md:grid-cols-[minmax(10rem,1.3fr)_minmax(7.5rem,0.8fr)_minmax(7.5rem,0.8fr)_minmax(5.5rem,0.5fr)]';
	const minWidthClass = 'min-w-[40rem] md:min-w-full';
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
		{row.probability}% likely to close
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-600">
		{row.stage}
	</span>
{/snippet}

<div class="pt-1">
	<DashboardTableShell
		{headers}
		{columnClass}
		{minWidthClass}
		ariaLabel="Account summary table"
		rowsLength={rows.length}
		interactiveRows={rows.some((row) => Boolean(row.href))}
	>
		{#snippet body()}
			<div class="divide-y divide-zinc-100">
				{#each rows as row (row.key)}
					{#if row.href}
						<a
							href={resolve(row.href)}
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
	</DashboardTableShell>
</div>
