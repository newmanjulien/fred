import { getActivityLevelLabel } from '$lib/dashboard/view-models/deal';
import { ACTIVITY_LEVELS, DEAL_INDUSTRIES, type ActivityLevel, type DealIndustry } from '$lib/types/vocab';
import type {
	NewBusinessListPageData,
	RenewalsListPageData
} from '$lib/dashboard/page-models';

export type LeadershipFilterDrawerData =
	| NewBusinessListPageData['filterDrawerData']
	| RenewalsListPageData['filterDrawerData'];

type BrokerOption = LeadershipFilterDrawerData['brokers'][number];

export type LeadershipFilterSectionId = 'broker' | 'activity-level' | 'industry';

export type LeadershipFilterOptionIdBySection = {
	broker: BrokerOption['key'];
	'activity-level': ActivityLevel;
	industry: DealIndustry;
};

export type LeadershipFilterExpansionState = Record<LeadershipFilterSectionId, boolean>;

export type LeadershipFilterOptionToggle = {
	[SectionId in LeadershipFilterSectionId]: {
		sectionId: SectionId;
		optionId: LeadershipFilterOptionIdBySection[SectionId];
	};
}[LeadershipFilterSectionId];

type CreateLeadershipFilterDrawerDataParams = {
	brokers: readonly BrokerOption[];
	industries: readonly DealIndustry[];
};

export function createLeadershipFilterDrawerData(
	params: CreateLeadershipFilterDrawerDataParams
): LeadershipFilterDrawerData {
	const activityLevels = ACTIVITY_LEVELS.map((activityLevel) => ({
		id: activityLevel,
		label: getActivityLevelLabel(activityLevel)
	}));
	const availableIndustries = new Set(params.industries);
	const industries = DEAL_INDUSTRIES.filter((industry) => availableIndustries.has(industry)).map(
		(industry) => ({
			id: industry,
			label: industry
		})
	);

	return {
		brokers: [...params.brokers],
		activityLevels,
		industries
	};
}

export function createDefaultLeadershipFilterExpansionState(): LeadershipFilterExpansionState {
	return {
		broker: true,
		'activity-level': false,
		industry: false
	};
}
