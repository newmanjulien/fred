<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import DashboardPageLayout from '$lib/dashboard/layout/DashboardPageLayout.svelte';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import {
		type DashboardHeaderButtonHandler,
		type DashboardHeaderUiScope
	} from '$lib/dashboard/shell/header/ui-controller';
	import type { ActivityLevel, AccountIndustry } from '$lib/types/vocab';
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import Drawer from './filters/Drawer.svelte';
	import DesktopTable from './DesktopTable.svelte';
	import {
		createDefaultLeadershipFilterExpansionState,
		type LeadershipFilterDrawerData,
		type LeadershipFilterOptionToggle,
		type LeadershipFilterSectionId
	} from './filters/model';
	import { buildLeadershipFilterDrawerSections } from './filters/sections';
	import {
		getLeadershipSelectionHeaderUiScope,
		getStaleLeadershipSelectionRowKeys
	} from './likely-out-of-date';

	type LeadershipListPageData = NewBusinessListPageData | RenewalsListPageData;
	type BrokerKey = LeadershipFilterDrawerData['brokers'][number]['key'];

	type Props = {
		data: LeadershipListPageData;
		scopeId: string;
		tableAriaLabel: string;
		likelyOutOfDateTableAriaLabel: string;
		infoText?: string | null;
	};

	let {
		data,
		scopeId,
		tableAriaLabel,
		likelyOutOfDateTableAriaLabel,
		infoText
	}: Props = $props();
	const filterDrawerData = $derived(data.filterDrawerData);
	let isFilterDrawerOpen = $state(false);
	let expandedSections = $state(createDefaultLeadershipFilterExpansionState());
	let selectedBrokerKeys = $state<BrokerKey[]>([]);
	let selectedActivityLevels = $state<ActivityLevel[]>([]);
	let selectedIndustries = $state<AccountIndustry[]>([]);
	let selectedRenewalDates = $state<string[]>([]);
	let selectedRowKeys = new SvelteSet<LeadershipListPageData['rows'][number]['key']>();
	const filterDrawerSections = $derived(
		buildLeadershipFilterDrawerSections({
			data: filterDrawerData,
			selectedBrokerKeys,
			selectedActivityLevels,
			selectedIndustries,
			selectedRenewalDates,
			expandedSections
		})
	);

	$effect(() => {
		selectedBrokerKeys = filterDrawerData.brokers.map((broker) => broker.key);
		selectedActivityLevels = filterDrawerData.activityLevels.map((activityLevel) => activityLevel.id);
		selectedIndustries = filterDrawerData.industries.map((industry) => industry.id);
		selectedRenewalDates = filterDrawerData.renewalDates?.map((renewalDate) => renewalDate.id) ?? [];
	});

	$effect(() => {
		const staleRowKeys = getStaleLeadershipSelectionRowKeys(selectedRowKeys, data.rows);

		for (const rowKey of staleRowKeys) {
			selectedRowKeys.delete(rowKey);
		}
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

	function toggleFilterSection(sectionId: LeadershipFilterSectionId) {
		const isExpanding = !expandedSections[sectionId];

		expandedSections = {
			broker: false,
			'activity-level': false,
			industry: false,
			'renewal-date': false,
			[sectionId]: isExpanding
		};
	}

	function toggleFilterOption(toggle: LeadershipFilterOptionToggle) {
		if (toggle.sectionId === 'broker') {
			selectedBrokerKeys = toggleSelectedValue(selectedBrokerKeys, toggle.optionId);
			return;
		}

		if (toggle.sectionId === 'activity-level') {
			selectedActivityLevels = toggleSelectedValue(selectedActivityLevels, toggle.optionId);
			return;
		}

		if (toggle.sectionId === 'renewal-date') {
			selectedRenewalDates = toggleSelectedValue(selectedRenewalDates, toggle.optionId);
			return;
		}

		selectedIndustries = toggleSelectedValue(selectedIndustries, toggle.optionId);
	}

	function toggleSelectedRow(
		rowKey: LeadershipListPageData['rows'][number]['key'],
		checked: boolean
	) {
		if (checked) {
			selectedRowKeys.add(rowKey);
		} else {
			selectedRowKeys.delete(rowKey);
		}
	}

	function toggleAllSelectedRows(
		rowKeys: readonly LeadershipListPageData['rows'][number]['key'][],
		checked: boolean
	) {
		for (const rowKey of rowKeys) {
			if (checked) {
				selectedRowKeys.add(rowKey);
			} else {
				selectedRowKeys.delete(rowKey);
			}
		}
	}

	function getHeaderUiScope(filterHandler: DashboardHeaderButtonHandler): DashboardHeaderUiScope {
		return {
			buttons: [
				{
					id: 'filter',
					label: 'Filter',
					order: 20
				},
				...(getLeadershipSelectionHeaderUiScope(selectedRowKeys.size).buttons ?? [])
			],
			handlers: {
				filter: filterHandler,
				...getLeadershipSelectionHeaderUiScope(selectedRowKeys.size).handlers
			}
		};
	}

	const selection = {
		selectedRowKeys,
		onToggleRow: toggleSelectedRow,
		onToggleAllRows: toggleAllSelectedRows
	};
</script>

<Drawer
	open={isFilterDrawerOpen}
	sections={filterDrawerSections}
	onClose={closeFilterDrawer}
	onToggleSection={toggleFilterSection}
	onToggleOption={toggleFilterOption}
/>

<DashboardHeaderScope scopeId={scopeId} scope={getHeaderUiScope(toggleFilterDrawer)} />

<DashboardPageLayout width="wide">
	{#snippet body()}
		<DesktopTable
			pageKind={data.route.kind}
			rows={data.rows}
			{selection}
			ariaLabel={data.route.view === 'likely-out-of-date'
				? likelyOutOfDateTableAriaLabel
				: tableAriaLabel}
			{infoText}
		/>
	{/snippet}
</DashboardPageLayout>
