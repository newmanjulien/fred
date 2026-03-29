<script lang="ts">
	import DashboardPageLayout from '$lib/dashboard/layout/DashboardPageLayout.svelte';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import {
		type DashboardHeaderButtonHandler,
		type DashboardHeaderUiScope
	} from '$lib/dashboard/shell/header/ui-controller';
	import InlineInfoBar from '$lib/dashboard/ui/shared/InlineInfoBar.svelte';
	import type { ActivityLevel, AccountIndustry } from '$lib/types/vocab';
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import type { NewBusinessView } from '$lib/dashboard/routing/new-business';
	import type { RenewalsView } from '$lib/dashboard/routing/renewals';
	import Drawer from './filters/Drawer.svelte';
	import Table from './Table.svelte';
	import LikelyOutOfDateTable from './LikelyOutOfDateTable.svelte';
	import {
		createDefaultLeadershipFilterExpansionState,
		type LeadershipFilterDrawerData,
		type LeadershipFilterOptionToggle,
		type LeadershipFilterSectionId
	} from './filters/model';
	import { buildLeadershipFilterDrawerSections } from './filters/sections';

	const NEW_BUSINESS_INFO_BAR_TEXT_BY_VIEW: Partial<Record<NewBusinessView, string>> = {
		accounts: 'All the new business your brokers are working on',
		'next-60-days':
			'Accounts which might close in the next 60 days',
		'need-support':
			'Accounts where the broker may need support',
		'duplicated-work':
			'Accounts where multiple brokers are doing the same work',
		unassigned: 'Unassigned accounts which are not being worked by any broker',
		'likely-out-of-date':
			"We suspect that our data is out of date but you can ask the broker for an update"
	};

	const RENEWALS_INFO_BAR_TEXT_BY_VIEW: Partial<Record<RenewalsView, string>> = {
		accounts: 'All the renewals your brokers are working on',
		'next-60-days':
			'Accounts which might renew in the next 60 days',
		'need-support':
			'Accounts where the broker may need support',
		'likely-out-of-date':
			"We suspect that our data is out of date but you can ask the broker for an update"
	};

	type LeadershipListPageData = NewBusinessListPageData | RenewalsListPageData;
	type BrokerKey = LeadershipFilterDrawerData['brokers'][number]['key'];

	type Props = {
		data: LeadershipListPageData;
		scopeId: string;
		tableAriaLabel: string;
		likelyOutOfDateTableAriaLabel: string;
		probabilityLabel?: string;
	};

	let {
		data,
		scopeId,
		tableAriaLabel,
		likelyOutOfDateTableAriaLabel,
		probabilityLabel = 'likely to close'
	}: Props = $props();
	const filterDrawerData = $derived(data.filterDrawerData);
	let isFilterDrawerOpen = $state(false);
	let expandedSections = $state(createDefaultLeadershipFilterExpansionState());
	let selectedBrokerKeys = $state<BrokerKey[]>([]);
	let selectedActivityLevels = $state<ActivityLevel[]>([]);
	let selectedIndustries = $state<AccountIndustry[]>([]);
	const filterDrawerSections = $derived(
		buildLeadershipFilterDrawerSections({
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

	function toggleFilterSection(sectionId: LeadershipFilterSectionId) {
		const isExpanding = !expandedSections[sectionId];

		expandedSections = {
			broker: false,
			'activity-level': false,
			industry: false,
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

		selectedIndustries = toggleSelectedValue(selectedIndustries, toggle.optionId);
	}

	function getHeaderUiScope(filterHandler: DashboardHeaderButtonHandler): DashboardHeaderUiScope {
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

	function getInfoBarText(data: LeadershipListPageData) {
		if (data.route.kind === 'new-business-list') {
			return NEW_BUSINESS_INFO_BAR_TEXT_BY_VIEW[data.route.view] ?? null;
		}

		return RENEWALS_INFO_BAR_TEXT_BY_VIEW[data.route.view] ?? null;
	}
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
		<div class="pt-1">
			{#if data.route.view === 'likely-out-of-date'}
				<LikelyOutOfDateTable
					rows={data.rows}
					ariaLabel={likelyOutOfDateTableAriaLabel}
					{probabilityLabel}
				/>
			{:else}
				<Table rows={data.rows} ariaLabel={tableAriaLabel} {probabilityLabel} />
			{/if}

			{#if data.rows.length > 0}
				<InlineInfoBar
					dataAttribute="data-leadership-table-info-bar"
					text={getInfoBarText(data)}
				/>
			{/if}
		</div>
	{/snippet}
</DashboardPageLayout>
