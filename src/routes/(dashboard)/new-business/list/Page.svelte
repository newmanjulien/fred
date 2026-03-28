<script lang="ts">
	import type { NewBusinessListPageData } from '$lib/dashboard/page-models/newBusiness';
	import DashboardPageLayout from '$lib/dashboard/layout/DashboardPageLayout.svelte';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import {
		type DashboardHeaderButtonHandler,
		type DashboardHeaderUiScope
	} from '$lib/dashboard/shell/header/ui-controller';
	import type { ActivityLevel, DealIndustry } from '$lib/types/vocab';
	import Drawer from './filters/Drawer.svelte';
	import Table from './Table.svelte';
	import LikelyOutOfDateTable from './LikelyOutOfDateTable.svelte';
	import {
		createDefaultNewBusinessFilterExpansionState,
		type NewBusinessFilterDrawerData,
		type NewBusinessFilterOptionToggle,
		type NewBusinessFilterSectionId
	} from './filters/model';
	import { buildNewBusinessFilterDrawerSections } from './filters/sections';

	type BrokerKey = NewBusinessFilterDrawerData['brokers'][number]['key'];

	type Props = {
		data: NewBusinessListPageData;
	};

	const HEADER_SCOPE_ID = 'new-business-list';

	let { data }: Props = $props();
	const filterDrawerData = $derived(data.filterDrawerData);
	let isFilterDrawerOpen = $state(false);
	let expandedSections = $state(createDefaultNewBusinessFilterExpansionState());
	let selectedBrokerKeys = $state<BrokerKey[]>([]);
	let selectedActivityLevels = $state<ActivityLevel[]>([]);
	let selectedIndustries = $state<DealIndustry[]>([]);
	const filterDrawerSections = $derived(
		buildNewBusinessFilterDrawerSections({
			data: filterDrawerData,
			selectedBrokerKeys,
			selectedActivityLevels,
			selectedIndustries,
			expandedSections
		})
	);

	$effect(() => {
		selectedBrokerKeys = filterDrawerData.brokers.map((broker) => broker.key);
		selectedActivityLevels = filterDrawerData.activityLevels.map((activityLevel) => activityLevel.id);
		selectedIndustries = filterDrawerData.industries.map((industry) => industry.id);
	});

	function toggleFilterDrawer() {
		isFilterDrawerOpen = !isFilterDrawerOpen;
	}

	function closeFilterDrawer() {
		isFilterDrawerOpen = false;
	}

	function toggleSelectedValue<T extends string>(selectedValues: readonly T[], value: T) {
		return selectedValues.includes(value)
			? selectedValues.filter((selectedValue) => selectedValue !== value)
			: [...selectedValues, value];
	}

	function toggleFilterSection(sectionId: NewBusinessFilterSectionId) {
		const isExpanding = !expandedSections[sectionId];

		expandedSections = {
			broker: false,
			'activity-level': false,
			industry: false,
			[sectionId]: isExpanding
		};
	}

	function toggleFilterOption(toggle: NewBusinessFilterOptionToggle) {
		if (toggle.sectionId === 'broker') {
			selectedBrokerKeys = toggleSelectedValue(selectedBrokerKeys, toggle.optionId);
			return;
		}

		if (toggle.sectionId === 'activity-level') {
			selectedActivityLevels = toggleSelectedValue(selectedActivityLevels, toggle.optionId);
			return;
		}

		selectedIndustries = toggleSelectedValue(selectedIndustries, toggle.optionId);
	}

	function getNewBusinessHeaderUiScope(
		filterHandler: DashboardHeaderButtonHandler
	): DashboardHeaderUiScope {
		return {
			buttons: [
				{
					id: 'filter',
					label: 'Filter',
					order: 20
				}
			],
			handlers: {
				filter: filterHandler
			}
		};
	}
</script>

<Drawer
	open={isFilterDrawerOpen}
	sections={filterDrawerSections}
	onClose={closeFilterDrawer}
	onToggleSection={toggleFilterSection}
	onToggleOption={toggleFilterOption}
/>

<DashboardHeaderScope
	scopeId={HEADER_SCOPE_ID}
	scope={getNewBusinessHeaderUiScope(toggleFilterDrawer)}
/>

<DashboardPageLayout width="wide">
	{#snippet body()}
		<div class="pt-1">
			{#if data.route.view === 'likely-out-of-date'}
				<LikelyOutOfDateTable rows={data.rows} />
			{:else}
				<Table rows={data.rows} />
			{/if}
		</div>
	{/snippet}
</DashboardPageLayout>
