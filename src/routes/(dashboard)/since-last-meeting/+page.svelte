<script lang="ts">
	import DashboardResponsiveTabbedPage from '$lib/dashboard/layout/DashboardResponsiveTabbedPage.svelte';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import TimelineSection from '$lib/dashboard/ui/detail/TimelineSection.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import AccountTable from './AccountTable.svelte';

	let { data } = $props();

	const desktopTabs = [
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'accounts', label: 'Accounts' },
		{ id: 'update', label: 'Update' }
	] as const;

	const mobileTabs = [
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'accounts', label: 'Accounts' }
	] as const;
</script>

<DashboardResponsiveTabbedPage hero={data.hero} width="normal" {desktopTabs} {mobileTabs}>
	{#snippet body()}
		<SectionTabPanel tabId="timeline">
			<TimelineSection items={data.timelineItems} />
		</SectionTabPanel>
		<SectionTabPanel tabId="accounts">
			<AccountTable rows={data.accounts} />
		</SectionTabPanel>
		<SectionTabPanel tabId="update">
			<FileUploadField data={data.update} />
		</SectionTabPanel>
	{/snippet}
</DashboardResponsiveTabbedPage>
