import {
	getActivityLevelIconVariant,
	type ActivityLevelIconVariant
} from '$lib/dashboard/view-models/deal';
import type { SearchableFilterPanelOption } from '$lib/dashboard/ui/pickers/filter-panel';
import type { ActivityLevel, DealIndustry } from '$lib/types/vocab';
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

export type LeadershipIndustryFilterOption = BaseFilterOption<DealIndustry>;

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
	selectedIndustries: readonly DealIndustry[];
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

function buildBrokerSection(
	params: BuildLeadershipFilterDrawerSectionsParams
): LeadershipBrokerFilterSection {
	const options = sortSelectedOptions(
		params.data.brokers.map((broker) => ({
			id: broker.key,
			label: broker.name,
			selected: params.selectedBrokerKeys.includes(broker.key),
			avatar: broker.avatar
		}))
	);

	return {
		id: 'broker',
		title: 'Broker',
		summary: getSectionSummary(params.selectedBrokerKeys.length),
		expanded: params.expandedSections.broker,
		collapsible: true,
		searchLabel: 'Search brokers',
		searchPlaceholder: 'Search brokers',
		emptyLabel: 'No brokers found',
		options
	};
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
	const options = sortSelectedOptions(
		params.data.industries.map((industry) => ({
			id: industry.id,
			label: industry.label,
			selected: params.selectedIndustries.includes(industry.id)
		}))
	);

	return {
		id: 'industry',
		title: 'Industry',
		summary: getSectionSummary(params.selectedIndustries.length),
		expanded: params.expandedSections.industry,
		collapsible: true,
		searchLabel: 'Search industries',
		searchPlaceholder: 'Search industries',
		emptyLabel: 'No industries found',
		options
	};
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
