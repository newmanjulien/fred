import type { BrokerId } from '../lib/types/ids';
import { getActivityLevelLabel } from '../lib/dashboard/view-models/account';
import { formatUtcMonthYear } from '../lib/format/date-time';
import {
	type PersonSummaryMap,
	resolveOptionalBrokerPerson
} from '../lib/dashboard/view-models/account-content';
import { ACCOUNT_INDUSTRIES, type ActivityLevel, type AccountIndustry } from '../lib/types/vocab';
import type { DashboardPerson } from '../lib/models/person';
import type { AccountRecordData } from './readModels';

const NO_ACTIVITY_LABEL = 'No recorded activity';

function createRenewalMonthFilterOptions(now: Date = new Date()) {
	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

	return Array.from({ length: 12 }, (_, index) => {
		const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
		const year = date.getUTCFullYear();
		const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');

		return {
			id: `${year}-${month}`,
			label: formatUtcMonthYear(date)
		};
	});
}

export type LeadershipListTableRow = {
	key: AccountRecordData['key'];
	kind: AccountRecordData['kind'];
	hasDetail: boolean;
	renewalDate?: AccountRecordData['renewalDate'];
	revenue?: AccountRecordData['revenue'];
	probability: number;
	activityLevel: AccountRecordData['activityLevel'];
	account: string;
	industry: AccountRecordData['industry'];
	stage?: AccountRecordData['stage'];
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
		kind: account.kind,
		hasDetail: Boolean(account.context),
		renewalDate: account.renewalDate,
		revenue: account.revenue,
		probability: account.probability,
		activityLevel: account.activityLevel,
		account: account.accountName,
		industry: account.industry,
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
	accounts: readonly AccountRecordData[],
	options?: {
		includeRenewalDates?: boolean;
	}
) {
	const industries = new Set(accounts.map((account) => account.industry));
	const renewalDates = options?.includeRenewalDates
		? createRenewalMonthFilterOptions()
		: undefined;

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
		})),
		renewalDates
	};
}
