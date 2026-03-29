<script lang="ts">
	import { Lightbulb, TriangleAlert } from 'lucide-svelte';
	import DashboardResponsiveDetailTabbedLayout from '$lib/dashboard/layout/DashboardResponsiveDetailTabbedLayout.svelte';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import OrgChartSection from '$lib/dashboard/ui/detail/OrgChartSection.svelte';
	import TimelineSection from '$lib/dashboard/ui/detail/TimelineSection.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';

	let { data } = $props();

	const desktopTabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'org-chart', label: 'Org chart' },
		{ id: 'update', label: 'Update' }
	] as const;

	const mobileTabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'org-chart', label: 'Org chart' }
	] as const;

	const detailIcon = $derived(data.kind === 'opportunity' ? Lightbulb : TriangleAlert);
</script>

<DashboardResponsiveDetailTabbedLayout
	hero={data.hero}
	icon={detailIcon}
	rightRailData={data.rightRail}
	{desktopTabs}
	{mobileTabs}
>
	{#snippet body()}
		<SectionTabPanel tabId="activity">
			<TimelineSection items={data.activityItems} />
		</SectionTabPanel>
		<SectionTabPanel tabId="org-chart">
			<OrgChartSection root={data.orgChartRoot} />
		</SectionTabPanel>
		<SectionTabPanel tabId="update">
			<FileUploadField data={data.update} />
		</SectionTabPanel>
	{/snippet}
</DashboardResponsiveDetailTabbedLayout>
