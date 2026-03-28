import type { BrokerKey, DealKey } from '$lib/types/keys';
import type { ActivityLevel, DealIndustry } from '$lib/types/vocab';
import type { IsoDateTime } from '$lib/types/dates';
import {
	formatIsoDateTimeRelative,
	formatIsoDateTimeRelativeMonths
} from '$lib/format/date-time';

type PersonSummaryLike = {
	key: BrokerKey;
	name: string;
	avatar: string;
};

type DealHelpfulContactLike = {
	id: string;
	name: string;
	title: string;
	company: string;
	linkedInUrl: string;
};

type DealContextLike = {
	summary: string;
	claimedAtIso: IsoDateTime;
	helpfulContacts?: readonly DealHelpfulContactLike[];
};

type DealOverviewLike = {
	key: DealKey;
	dealName: string;
	dealNumber: number;
	activityLevel: ActivityLevel;
	industry: DealIndustry;
	stage: string;
	lastActivityAtIso?: IsoDateTime;
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
			value: DealIndustry;
			dealKey: DealKey;
	  }
	| {
			id: string;
			label: string;
			kind: 'deal-number';
			dealNumber: number;
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
	helpfulContacts: readonly DealHelpfulContactLike[]
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
	deal: DealOverviewLike,
	owner: PersonSummaryLike | null
): DetailRightRailSection {
	return {
		id: 'deal-overview',
		kind: 'rows',
		rows: [
			{
				id: 'deal',
				label: 'Deal',
				kind: 'text',
				value: deal.dealName
			},
			{
				id: 'deal-number',
				label: 'ID',
				kind: 'deal-number',
				dealNumber: deal.dealNumber
			},
			{
				id: 'activity-level',
				label: 'Activity',
				kind: 'activity-level',
				activityLevel: deal.activityLevel
			},
			{
				id: 'industry',
				label: 'Industry',
				kind: 'industry',
				value: deal.industry,
				dealKey: deal.key
			},
			{
				id: 'owner',
				label: 'Owner',
				kind: 'person',
				person: owner,
				emptyValue: 'Unassigned'
			},
			{
				id: 'stage',
				label: 'Stage',
				kind: 'text',
				value: deal.stage
			}
		]
	};
}

export function toDetailRightRailTimingSection(
	deal: DealOverviewLike,
	detailContext: DealContextLike
): DetailRightRailSection {
	return {
		id: 'deal-timing',
		kind: 'rows',
		rows: [
			{
				id: 'claimed',
				label: 'Claimed',
				kind: 'text',
				value: formatIsoDateTimeRelativeMonths(detailContext.claimedAtIso)
			},
			{
				id: 'last-activity',
				label: 'Last activity',
				kind: 'text',
				value: deal.lastActivityAtIso
					? formatIsoDateTimeRelative(deal.lastActivityAtIso)
					: formatIsoDateTimeRelativeMonths(detailContext.claimedAtIso)
			}
		]
	};
}

export function toDetailRightRailHelpfulContactsSection(
	detailContext: DealContextLike
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
