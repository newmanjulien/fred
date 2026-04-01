<script lang="ts">
	import { List } from 'lucide-svelte';
	import DashboardResponsiveDetailTabbedLayout from '$lib/dashboard/layout/DashboardResponsiveDetailTabbedLayout.svelte';
	import type { RenewalsDetailPageData } from '$lib/dashboard/page-models/renewals';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import OrgChartSection from '$lib/dashboard/ui/detail/OrgChartSection.svelte';
	import TimelineSection from '$lib/dashboard/ui/detail/TimelineSection.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import BrokerTileList from './BrokerTileList.svelte';

	type Props = {
		data: RenewalsDetailPageData;
	};

	let { data }: Props = $props();

	const desktopTabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'brokers', label: 'Brokers' },
		{ id: 'org-chart', label: 'Org chart' },
		{ id: 'update', label: 'Update' }
	] as const;

	const mobileTabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'brokers', label: 'Brokers' },
		{ id: 'org-chart', label: 'Org chart' }
	] as const;
</script>

<DashboardResponsiveDetailTabbedLayout
	hero={data.hero}
	icon={List}
	rightRailData={data.rightRail}
	{desktopTabs}
	{mobileTabs}
>
	{#snippet body()}
		<SectionTabPanel tabId="activity">
			<TimelineSection items={data.activityItems} />
		</SectionTabPanel>
		<SectionTabPanel tabId="brokers">
			<BrokerTileList tiles={data.brokerTiles} />
		</SectionTabPanel>
		<SectionTabPanel tabId="org-chart">
			<OrgChartSection root={data.orgChartRoot} />
		</SectionTabPanel>
		<SectionTabPanel tabId="update">
			<FileUploadField data={data.update} />
		</SectionTabPanel>
	{/snippet}
</DashboardResponsiveDetailTabbedLayout>
