import { getActivityLevelLabel } from '$lib/dashboard/view-models/deal';
import { ACTIVITY_LEVELS, DEAL_INDUSTRIES, type ActivityLevel, type DealIndustry } from '$lib/types/vocab';
import type { NewBusinessListPageData } from '$lib/dashboard/page-models/newBusiness';

export type NewBusinessFilterDrawerData = NewBusinessListPageData['filterDrawerData'];

type BrokerOption = NewBusinessFilterDrawerData['brokers'][number];

export type NewBusinessFilterSectionId = 'broker' | 'activity-level' | 'industry';

export type NewBusinessFilterOptionIdBySection = {
	broker: BrokerOption['key'];
	'activity-level': ActivityLevel;
	industry: DealIndustry;
};

export type NewBusinessFilterExpansionState = Record<NewBusinessFilterSectionId, boolean>;

export type NewBusinessFilterOptionToggle = {
	[SectionId in NewBusinessFilterSectionId]: {
		sectionId: SectionId;
		optionId: NewBusinessFilterOptionIdBySection[SectionId];
	};
}[NewBusinessFilterSectionId];

type CreateNewBusinessFilterDrawerDataParams = {
	brokers: readonly BrokerOption[];
	industries: readonly DealIndustry[];
};

export function createNewBusinessFilterDrawerData(
	params: CreateNewBusinessFilterDrawerDataParams
): NewBusinessFilterDrawerData {
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

export function createDefaultNewBusinessFilterExpansionState(): NewBusinessFilterExpansionState {
	return {
		broker: true,
		'activity-level': false,
		industry: false
	};
}
