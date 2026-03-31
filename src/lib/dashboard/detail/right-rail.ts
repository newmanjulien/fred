import type { BrokerKey, AccountKey } from '$lib/types/keys';
import type { AccountKind, ActivityLevel, AccountIndustry } from '$lib/types/vocab';
import type { IsoDate, IsoDateTime } from '$lib/types/dates';
import { formatUsdAmount } from '$lib/format/number';
import { formatIsoDateTimeRelative, formatIsoDateTimeRelativeMonths } from '$lib/format/date-time';

type PersonSummaryLike = {
	key: BrokerKey;
	name: string;
	avatar: string;
};

type AccountHelpfulContactLike = {
	id: string;
	name: string;
	title: string;
	company: string;
	linkedInUrl: string;
};

type AccountContextLike = {
	summary: string;
	claimedAtIso: IsoDateTime;
	helpfulContacts?: readonly AccountHelpfulContactLike[];
};

type AccountOverviewLike = {
	key: AccountKey;
	kind: AccountKind;
	accountName: string;
	accountNumber: number;
	activityLevel: ActivityLevel;
	industry: AccountIndustry;
	stage?: string;
	lastActivityAtIso?: IsoDateTime;
	renewalDate?: IsoDate;
	revenue?: number;
};

type DetailRightRailTimingSectionOptions = {
	showRenewalDate?: boolean;
};

export type DetailRightRailRow =
	| {
			id: string;
			label: string;
			kind: 'text';
			value: string;
	  }
	| {
			id: string;
			label: string;
			kind: 'industry';
			value: AccountIndustry;
			accountKey: AccountKey;
	  }
	| {
			id: string;
			label: string;
			kind: 'account-number';
			accountNumber: number;
	  }
	| {
			id: string;
			label: string;
			kind: 'activity-level';
			activityLevel: ActivityLevel;
	  }
	| {
			id: string;
			label: string;
			kind: 'person';
			person: PersonSummaryLike | null;
			emptyValue?: string;
	  }
	| {
			id: string;
			label: string;
			kind: 'renewal-date';
			dateIso?: IsoDate;
			emptyValue?: string;
	  };

export type DetailRightRailHelpfulContact = {
	id: string;
	name: string;
	title: string;
	company: string;
	linkedInUrl: string;
};

export type DetailRightRailSection =
	| {
			id: string;
			kind: 'rows';
			rows: DetailRightRailRow[];
	  }
	| {
			id: string;
			kind: 'helpful-contacts';
			title: string;
			contacts: DetailRightRailHelpfulContact[];
	  };

export type DetailRightRailData = {
	sections: DetailRightRailSection[];
};

function isDetailRightRailSection(
	section: DetailRightRailSection | null | undefined | false
): section is DetailRightRailSection {
	return Boolean(section);
}

function toDetailRightRailHelpfulContacts(
	helpfulContacts: readonly AccountHelpfulContactLike[]
): DetailRightRailHelpfulContact[] {
	return helpfulContacts.map<DetailRightRailHelpfulContact>((contact) => ({
		id: contact.id,
		name: contact.name,
		title: contact.title,
		company: contact.company,
		linkedInUrl: contact.linkedInUrl
	}));
}

export function toDetailRightRailData(
	sections: readonly (DetailRightRailSection | null | undefined | false)[]
): DetailRightRailData {
	return {
		sections: sections.filter(isDetailRightRailSection)
	};
}

export function toDetailRightRailOverviewSection(
	account: AccountOverviewLike,
	owner: PersonSummaryLike | null
): DetailRightRailSection {
	const shouldShowRevenue = account.kind === 'renewal';

	return {
		id: 'account-overview',
		kind: 'rows',
		rows: [
			{
				id: 'account',
				label: 'Account',
				kind: 'text',
				value: account.accountName
			},
			{
				id: 'account-number',
				label: 'ID',
				kind: 'account-number',
				accountNumber: account.accountNumber
			},
			{
				id: 'activity-level',
				label: 'Activity',
				kind: 'activity-level',
				activityLevel: account.activityLevel
			},
			{
				id: 'industry',
				label: 'Industry',
				kind: 'industry',
				value: account.industry,
				accountKey: account.key
			},
			{
				id: 'owner',
				label: 'Owner',
				kind: 'person',
				person: owner,
				emptyValue: 'Unassigned'
			},
			...(shouldShowRevenue
				? [
						{
							id: 'revenue',
							label: 'Revenue',
							kind: 'text' as const,
							value: account.revenue == null ? 'No revenue' : formatUsdAmount(account.revenue)
						}
					]
				: account.stage
					&& account.kind === 'new-business'
					? [
							{
								id: 'stage',
								label: 'Stage',
								kind: 'text' as const,
								value: account.stage
							}
						]
					: [])
		]
	};
}

export function toDetailRightRailTimingSection(
	account: AccountOverviewLike,
	detailContext: AccountContextLike,
	options: DetailRightRailTimingSectionOptions = {}
): DetailRightRailSection {
	const primaryTimingRow = options.showRenewalDate
		? {
				id: 'renewal-date',
				label: 'Renewal',
				kind: 'renewal-date' as const,
				dateIso: account.renewalDate,
				emptyValue: 'No renewal date'
			}
		: {
				id: 'claimed',
				label: 'Claimed',
				kind: 'text' as const,
				value: formatIsoDateTimeRelativeMonths(detailContext.claimedAtIso)
			};

	return {
		id: 'account-timing',
		kind: 'rows',
		rows: [
			primaryTimingRow,
			{
				id: 'last-activity',
				label: 'Last activity',
				kind: 'text',
				value: account.lastActivityAtIso
					? formatIsoDateTimeRelative(account.lastActivityAtIso)
					: formatIsoDateTimeRelativeMonths(detailContext.claimedAtIso)
			}
		]
	};
}

export function toDetailRightRailHelpfulContactsSection(
	detailContext: AccountContextLike
): DetailRightRailSection | null {
	if (!detailContext.helpfulContacts?.length) {
		return null;
	}

	return {
		id: 'helpful-contacts',
		kind: 'helpful-contacts',
		title: 'Contacts who can help',
		contacts: toDetailRightRailHelpfulContacts(detailContext.helpfulContacts)
	};
}
