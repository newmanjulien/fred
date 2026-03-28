<script lang="ts">
	import { Lightbulb, TriangleAlert } from 'lucide-svelte';
	import DashboardTabbedPage from '$lib/dashboard/layout/DashboardTabbedPage.svelte';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import OpportunityTileList from './OpportunityTileList.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'opportunities-tiles', label: 'Opportunities' },
		{ id: 'risks-tiles', label: 'Risks' },
		{ id: 'update', label: 'Update', disabledOnMobile: true }
	] as const;
</script>

<DashboardTabbedPage hero={data.hero} width="normal" {tabs}>
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
</DashboardTabbedPage>
