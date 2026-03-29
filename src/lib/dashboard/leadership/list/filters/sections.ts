import {
	getActivityLevelIconVariant,
	type ActivityLevelIconVariant
} from '$lib/dashboard/view-models/account';
import type { SearchableFilterPanelOption } from '$lib/dashboard/ui/pickers/filter-panel';
import type { ActivityLevel, AccountIndustry } from '$lib/types/vocab';
import type {
	LeadershipFilterDrawerData,
	LeadershipFilterExpansionState
} from './model';

type BrokerOption = LeadershipFilterDrawerData['brokers'][number];

type BaseFilterOption<Id, Extra = object> = {
	id: Id;
	label: string;
	selected: boolean;
} & Extra;

export type LeadershipBrokerFilterOption = BaseFilterOption<
	BrokerOption['key'],
	{ avatar: string }
>;

export type LeadershipActivityLevelFilterOption = BaseFilterOption<
	ActivityLevel,
	{ iconVariant: ActivityLevelIconVariant }
>;

export type LeadershipIndustryFilterOption = BaseFilterOption<AccountIndustry>;

type BaseSection<Id extends string, Option> = {
	id: Id;
	title: string;
	summary: string;
	expanded: boolean;
	collapsible: boolean;
	options: readonly Option[];
};

type SearchableSection<Id extends string, Option extends SearchableFilterPanelOption> = BaseSection<
	Id,
	Option & { selected: boolean }
> & {
	searchLabel: string;
	searchPlaceholder: string;
	emptyLabel: string;
};

export type LeadershipBrokerFilterSection = SearchableSection<
	'broker',
	LeadershipBrokerFilterOption
>;

export type LeadershipActivityLevelFilterSection = BaseSection<
	'activity-level',
	LeadershipActivityLevelFilterOption
>;

export type LeadershipIndustryFilterSection = SearchableSection<
	'industry',
	LeadershipIndustryFilterOption
>;

export type LeadershipFilterDrawerSection =
	| LeadershipBrokerFilterSection
	| LeadershipActivityLevelFilterSection
	| LeadershipIndustryFilterSection;

type BuildLeadershipFilterDrawerSectionsParams = {
	data: LeadershipFilterDrawerData;
	selectedBrokerKeys: readonly BrokerOption['key'][];
	selectedActivityLevels: readonly ActivityLevel[];
	selectedIndustries: readonly AccountIndustry[];
	expandedSections: LeadershipFilterExpansionState;
};

function getSectionSummary(selectedCount: number) {
	if (selectedCount === 0) {
		return 'None';
	}

	return `${selectedCount} selected`;
}

function sortSelectedOptions<Option extends { selected: boolean; label: string }>(
	options: readonly Option[]
) {
	return [...options].sort((left, right) => {
		if (left.selected !== right.selected) {
			return left.selected ? -1 : 1;
		}

		return left.label.localeCompare(right.label);
	});
}

function buildSearchableSection<
	TSectionId extends string,
	TOption extends SearchableFilterPanelOption & { selected: boolean }
>(params: {
	id: TSectionId;
	title: string;
	selectedCount: number;
	expanded: boolean;
	searchLabel: string;
	searchPlaceholder: string;
	emptyLabel: string;
	options: readonly TOption[];
}): SearchableSection<TSectionId, TOption> {
	return {
		id: params.id,
		title: params.title,
		summary: getSectionSummary(params.selectedCount),
		expanded: params.expanded,
		collapsible: true,
		searchLabel: params.searchLabel,
		searchPlaceholder: params.searchPlaceholder,
		emptyLabel: params.emptyLabel,
		options: sortSelectedOptions(params.options)
	};
}

function buildBrokerSection(
	params: BuildLeadershipFilterDrawerSectionsParams
): LeadershipBrokerFilterSection {
	return buildSearchableSection({
		id: 'broker',
		title: 'Broker',
		selectedCount: params.selectedBrokerKeys.length,
		expanded: params.expandedSections.broker,
		searchLabel: 'Search brokers',
		searchPlaceholder: 'Search brokers',
		emptyLabel: 'No brokers found',
		options: params.data.brokers.map((broker) => ({
			id: broker.key,
			label: broker.name,
			selected: params.selectedBrokerKeys.includes(broker.key),
			avatar: broker.avatar
		}))
	});
}

function buildActivityLevelSection(
	params: BuildLeadershipFilterDrawerSectionsParams
): LeadershipActivityLevelFilterSection {
	return {
		id: 'activity-level',
		title: 'Activity level',
		summary: getSectionSummary(params.selectedActivityLevels.length),
		expanded: params.expandedSections['activity-level'],
		collapsible: true,
		options: params.data.activityLevels.map((activityLevel) => ({
			id: activityLevel.id,
			label: activityLevel.label,
			selected: params.selectedActivityLevels.includes(activityLevel.id),
			iconVariant: getActivityLevelIconVariant(activityLevel.id)
		}))
	};
}

function buildIndustrySection(
	params: BuildLeadershipFilterDrawerSectionsParams
): LeadershipIndustryFilterSection {
	return buildSearchableSection({
		id: 'industry',
		title: 'Industry',
		selectedCount: params.selectedIndustries.length,
		expanded: params.expandedSections.industry,
		searchLabel: 'Search industries',
		searchPlaceholder: 'Search industries',
		emptyLabel: 'No industries found',
		options: params.data.industries.map((industry) => ({
			id: industry.id,
			label: industry.label,
			selected: params.selectedIndustries.includes(industry.id)
		}))
	});
}

export function buildLeadershipFilterDrawerSections(
	params: BuildLeadershipFilterDrawerSectionsParams
): readonly LeadershipFilterDrawerSection[] {
	return [
		buildBrokerSection(params),
		buildActivityLevelSection(params),
		buildIndustrySection(params)
	];
}
