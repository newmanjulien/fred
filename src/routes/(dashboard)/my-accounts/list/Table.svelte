<script lang="ts">
	import { resolve } from '$app/paths';
	import { isInternalDashboardLink } from '$lib/dashboard/links';
	import type { MyAccountsListPageData } from '$lib/dashboard/page-models/myAccounts';
	import type { BrokerKey } from '$lib/types/keys';
	import { Check } from 'lucide-svelte';
	import NewsSourceInline from '$lib/dashboard/ui/detail/NewsSourceInline.svelte';
	import PersonInline from '$lib/dashboard/ui/people/PersonInline.svelte';
	import DashboardResponsiveTable from '$lib/dashboard/ui/shared/DashboardResponsiveTable.svelte';
	import { cn } from '$lib/support/cn';

	type MyAccountsTableRow = MyAccountsListPageData['rows'][number];

	type Props = {
		rows: readonly MyAccountsTableRow[];
		activeBrokerKey: BrokerKey;
	};

	const INFO_TEXT =
		'We automatially reserve accounts for you in Epic and accounts which are reserved have a checkmark';

	let { rows, activeBrokerKey }: Props = $props();

	const headers = ['Account', 'Latest news', 'Last activity', 'Owner', 'Reserved in Epic'] as const;
	const columnClass =
		'justify-start grid-cols-[minmax(8.5rem,10rem)_minmax(13rem,16rem)_minmax(13rem,16rem)_minmax(8rem,10rem)_minmax(8.5rem,10rem)] md:grid-cols-[minmax(11rem,14rem)_minmax(18rem,24rem)_minmax(18rem,24rem)_minmax(10rem,13rem)_minmax(9rem,11rem)]';
	const minWidthClass = 'min-w-[52rem] md:min-w-full';

	function toMyAccountsRows(value: readonly unknown[]) {
		return value as readonly MyAccountsTableRow[];
	}
</script>

{#snippet rowCells(row: MyAccountsTableRow, isLinked: boolean)}
	{@const showReservedInEpic = row.owner?.key === activeBrokerKey && row.isReservedInEpic}
	<span
		data-table-cell
		class={`overflow-hidden font-medium text-zinc-600${isLinked ? ' transition-colors group-hover:text-zinc-900' : ''}`}
	>
		<span class="block truncate">{row.account}</span>
	</span>
	<span data-table-cell class="overflow-hidden text-zinc-600">
		{#if row.latestNewsSource}
			<NewsSourceInline source={row.latestNewsSource} text={row.latestNews} />
		{:else}
			<span class="block truncate" title={row.latestNews}>{row.latestNews}</span>
		{/if}
	</span>
	<span
		data-table-cell
		class="overflow-hidden text-zinc-600"
		title={row.lastActivityDescription}
	>
		<span class="block truncate">{row.lastActivityDescription}</span>
	</span>
	<span data-table-cell class="overflow-hidden text-zinc-600">
		{#if row.owner}
			<PersonInline person={row.owner} class="flex min-w-0 w-full" truncate={true} />
		{:else}
			<span class="block truncate">Unassigned</span>
		{/if}
	</span>
	<span data-table-cell class="flex items-center justify-center text-zinc-600">
		{#if showReservedInEpic}
			<Check aria-hidden="true" class="size-3.5" />
			<span class="sr-only">Reserved in Epic: Yes</span>
		{:else}
			<span class="sr-only">Reserved in Epic: No</span>
		{/if}
	</span>
{/snippet}

<DashboardResponsiveTable
	class="pt-1"
	{headers}
	{columnClass}
	{minWidthClass}
	ariaLabel="My accounts table"
	rows={rows}
	infoText={INFO_TEXT}
	dataAttribute="data-my-accounts-accounts-info-bar"
>
		{#snippet body(visibleRows)}
			{@const pageRows = toMyAccountsRows(visibleRows)}
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
