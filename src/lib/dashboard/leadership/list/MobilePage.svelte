<script lang="ts">
	import DashboardPageLayout from '$lib/dashboard/layout/DashboardPageLayout.svelte';
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import MobileTable from './MobileTable.svelte';

	type LeadershipListPageData = NewBusinessListPageData | RenewalsListPageData;

	type Props = {
		data: LeadershipListPageData;
		tableAriaLabel: string;
		likelyOutOfDateTableAriaLabel: string;
		infoText?: string | null;
	};

	let { data, tableAriaLabel, likelyOutOfDateTableAriaLabel, infoText }: Props = $props();
</script>

<DashboardPageLayout width="wide">
	{#snippet body()}
		<MobileTable
			rows={data.rows}
			ariaLabel={data.route.view === 'likely-out-of-date'
				? likelyOutOfDateTableAriaLabel
				: tableAriaLabel}
			{infoText}
		/>
	{/snippet}
</DashboardPageLayout>
