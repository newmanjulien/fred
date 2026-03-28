<script lang="ts">
	import DashboardTabbedPage from '$lib/dashboard/layout/DashboardTabbedPage.svelte';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import TimelineSection from '$lib/dashboard/ui/detail/TimelineSection.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import DealTable from './DealTable.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'deals', label: 'Deals' },
		{ id: 'update', label: 'Update', disabledOnMobile: true }
	] as const;
</script>

<DashboardTabbedPage hero={data.hero} width="normal" {tabs}>
	{#snippet body()}
		<SectionTabPanel tabId="timeline">
			<TimelineSection items={data.timelineItems} />
		</SectionTabPanel>
		<SectionTabPanel tabId="deals">
			<DealTable rows={data.deals} />
		</SectionTabPanel>
		<SectionTabPanel tabId="update">
			<FileUploadField data={data.update} />
		</SectionTabPanel>
	{/snippet}
</DashboardTabbedPage>
