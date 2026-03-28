import type { BrokerId } from '../lib/types/ids';
import { getActivityLevelLabel } from '../lib/dashboard/view-models/deal';
import {
	type PersonSummaryMap,
	resolveOptionalBrokerPerson
} from '../lib/dashboard/view-models/deal-content';
import { DEAL_INDUSTRIES, type ActivityLevel, type DealIndustry } from '../lib/types/vocab';
import type { DealRecordData } from './readModels';
import type { DashboardPerson } from './validators';

const NO_ACTIVITY_LABEL = 'No recorded activity';

export type LeadershipListTableRow = {
	key: DealRecordData['key'];
	hasDetail: boolean;
	probability: number;
	activityLevel: DealRecordData['activityLevel'];
	deal: string;
	stage: string;
	lastActivity:
		| {
				kind: 'relative';
				atIso: NonNullable<DealRecordData['lastActivityAtIso']>;
		  }
		| {
				kind: 'text';
				label: string;
		  };
	owner: DashboardPerson | null;
};

export function hasListActivityData(
	deal: DealRecordData
): deal is DealRecordData & {
	lastActivityAtIso: NonNullable<DealRecordData['lastActivityAtIso']>;
} {
	return Boolean(deal.lastActivityAtIso);
}

export function toLeadershipTableRow(
	deal: DealRecordData,
	lastActivity: LeadershipListTableRow['lastActivity'],
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
): LeadershipListTableRow {
	return {
		key: deal.key,
		hasDetail: Boolean(deal.context),
		probability: deal.probability,
		activityLevel: deal.activityLevel,
		deal: deal.dealName,
		stage: deal.stage,
		lastActivity,
		owner: resolveOptionalBrokerPerson(peopleByBrokerId, deal.ownerBrokerId)
	};
}

export function toRelativeLastActivityRow(
	deal: DealRecordData & {
		lastActivityAtIso: NonNullable<DealRecordData['lastActivityAtIso']>;
	},
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return toLeadershipTableRow(
		deal,
		{
			kind: 'relative',
			atIso: deal.lastActivityAtIso
		},
		peopleByBrokerId
	);
}

export function toNoActivityRow(
	deal: DealRecordData,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return toLeadershipTableRow(
		deal,
		{
			kind: 'text',
			label: NO_ACTIVITY_LABEL
		},
			peopleByBrokerId
		);
}

export function createLeadershipFilterDrawerData(
	people: DashboardPerson[],
	deals: readonly DealRecordData[]
) {
	const industries = new Set(deals.map((deal) => deal.industry));

	return {
		brokers: people,
		activityLevels: [
			{ id: 'high' as ActivityLevel, label: getActivityLevelLabel('high') },
			{ id: 'medium' as ActivityLevel, label: getActivityLevelLabel('medium') },
			{ id: 'low' as ActivityLevel, label: getActivityLevelLabel('low') }
		],
		industries: DEAL_INDUSTRIES.filter((industry) => industries.has(industry)).map((industry) => ({
			id: industry as DealIndustry,
			label: industry
		}))
	};
}
