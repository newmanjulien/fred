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
		defaultFooterText?: string | null;
	};

	let { data, tableAriaLabel, likelyOutOfDateTableAriaLabel, defaultFooterText }: Props =
		$props();
</script>

<DashboardPageLayout width="wide">
	{#snippet body()}
		<MobileTable
			pageKind={data.route.kind}
			rows={data.rows}
			ariaLabel={data.route.view === 'likely-out-of-date'
				? likelyOutOfDateTableAriaLabel
				: tableAriaLabel}
			{defaultFooterText}
		/>
	{/snippet}
</DashboardPageLayout>
