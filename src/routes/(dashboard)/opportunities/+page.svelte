<script lang="ts">
	import { Lightbulb, TriangleAlert } from 'lucide-svelte';
	import DashboardResponsiveTabbedPage from '$lib/dashboard/layout/DashboardResponsiveTabbedPage.svelte';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import OpportunityTileList from './OpportunityTileList.svelte';

	let { data } = $props();

	const desktopTabs = [
		{ id: 'opportunities-tiles', label: 'Opportunities' },
		{ id: 'risks-tiles', label: 'Risks' },
		{ id: 'update', label: 'Update' }
	] as const;

	const mobileTabs = [
		{ id: 'opportunities-tiles', label: 'Opportunities' },
		{ id: 'risks-tiles', label: 'Risks' }
	] as const;
</script>

<DashboardResponsiveTabbedPage hero={data.hero} width="normal" {desktopTabs} {mobileTabs}>
	{#snippet body()}
		<SectionTabPanel tabId="opportunities-tiles">
			<OpportunityTileList tiles={data.opportunityTiles} icon={Lightbulb} />
		</SectionTabPanel>
		<SectionTabPanel tabId="risks-tiles">
			<OpportunityTileList tiles={data.riskTiles} icon={TriangleAlert} />
		</SectionTabPanel>
		<SectionTabPanel tabId="update">
			<FileUploadField data={data.update} />
		</SectionTabPanel>
	{/snippet}
</DashboardResponsiveTabbedPage>
