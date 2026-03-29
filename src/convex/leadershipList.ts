import type { BrokerId } from '../lib/types/ids';
import { getActivityLevelLabel } from '../lib/dashboard/view-models/account';
import {
	type PersonSummaryMap,
	resolveOptionalBrokerPerson
} from '../lib/dashboard/view-models/account-content';
import { ACCOUNT_INDUSTRIES, type ActivityLevel, type AccountIndustry } from '../lib/types/vocab';
import type { DashboardPerson } from '../lib/models/person';
import type { AccountRecordData } from './readModels';

const NO_ACTIVITY_LABEL = 'No recorded activity';

export type LeadershipListTableRow = {
	key: AccountRecordData['key'];
	hasDetail: boolean;
	isRenewal: boolean;
	probability: number;
	activityLevel: AccountRecordData['activityLevel'];
	account: string;
	stage: string;
	lastActivity:
		| {
				kind: 'relative';
				atIso: NonNullable<AccountRecordData['lastActivityAtIso']>;
		  }
		| {
				kind: 'text';
				label: string;
		  };
	owner: DashboardPerson | null;
};

export function hasListActivityData(
	account: AccountRecordData
): account is AccountRecordData & {
	lastActivityAtIso: NonNullable<AccountRecordData['lastActivityAtIso']>;
} {
	return Boolean(account.lastActivityAtIso);
}

export function toLeadershipTableRow(
	account: AccountRecordData,
	lastActivity: LeadershipListTableRow['lastActivity'],
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
): LeadershipListTableRow {
	return {
		key: account.key,
		hasDetail: Boolean(account.context),
		isRenewal: account.isRenewal,
		probability: account.probability,
		activityLevel: account.activityLevel,
		account: account.accountName,
		stage: account.stage,
		lastActivity,
		owner: resolveOptionalBrokerPerson(peopleByBrokerId, account.ownerBrokerId)
	};
}

export function toRelativeLastActivityRow(
	account: AccountRecordData & {
		lastActivityAtIso: NonNullable<AccountRecordData['lastActivityAtIso']>;
	},
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return toLeadershipTableRow(
		account,
		{
			kind: 'relative',
			atIso: account.lastActivityAtIso
		},
		peopleByBrokerId
	);
}

export function toNoActivityRow(
	account: AccountRecordData,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return toLeadershipTableRow(
		account,
		{
			kind: 'text',
			label: NO_ACTIVITY_LABEL
		},
			peopleByBrokerId
		);
}

export function createLeadershipFilterDrawerData(
	people: DashboardPerson[],
	accounts: readonly AccountRecordData[]
) {
	const industries = new Set(accounts.map((account) => account.industry));

	return {
		brokers: people,
		activityLevels: [
			{ id: 'high' as ActivityLevel, label: getActivityLevelLabel('high') },
			{ id: 'medium' as ActivityLevel, label: getActivityLevelLabel('medium') },
			{ id: 'low' as ActivityLevel, label: getActivityLevelLabel('low') }
		],
		industries: ACCOUNT_INDUSTRIES.filter((industry) => industries.has(industry)).map((industry) => ({
			id: industry as AccountIndustry,
			label: industry
		}))
	};
}
