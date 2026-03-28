<script lang="ts">
	import { Lightbulb, TriangleAlert } from 'lucide-svelte';
	import DashboardDetailTabbedLayout from '$lib/dashboard/layout/DashboardDetailTabbedLayout.svelte';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import OrgChartSection from '$lib/dashboard/ui/detail/OrgChartSection.svelte';
	import TimelineSection from '$lib/dashboard/ui/detail/TimelineSection.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'org-chart', label: 'Org chart' },
		{ id: 'update', label: 'Update', disabledOnMobile: true }
	] as const;

	const detailIcon = $derived(data.kind === 'opportunity' ? Lightbulb : TriangleAlert);
</script>

<DashboardDetailTabbedLayout
	hero={data.hero}
	icon={detailIcon}
	rightRailData={data.rightRail}
	{tabs}
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
</DashboardDetailTabbedLayout>
