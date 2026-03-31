import { v } from 'convex/values';
import {
	type NewBusinessView,
	DEFAULT_NEW_BUSINESS_VIEW,
	NEW_BUSINESS_NON_DEFAULT_VIEWS
} from '../lib/dashboard/routing/new-business';
import {
	DEFAULT_RENEWALS_VIEW,
	RENEWALS_NON_DEFAULT_VIEWS,
	type RenewalsView
} from '../lib/dashboard/routing/renewals';
import {
	DEFAULT_MY_ACCOUNTS_VIEW,
	MY_ACCOUNTS_DETAIL_TAB_IDS,
	MY_ACCOUNTS_NON_DEFAULT_VIEWS,
	type MyAccountsDetailTabId,
	type MyAccountsView
} from '../lib/dashboard/routing/my-accounts';
import type { DetailRightRailData } from '../lib/dashboard/detail/right-rail';
import type { CanvasHeroData } from '../lib/dashboard/ui/detail/CanvasHero.types';
import type { FileUploadFieldData } from '../lib/dashboard/ui/detail/FileUploadField.types';
import type { IsoDate, IsoDateTime } from '../lib/types/dates';
import type { BrokerKey, AccountKey, InsightKey, MeetingKey } from '../lib/types/keys';
import type { AccountSummaryRow } from '../lib/models/account';
import type { OrgChartNodeRecord as SharedOrgChartNodeRecord } from '../lib/models/org-chart';
import type {
	DashboardMeeting as SharedDashboardMeeting,
	DashboardPerson as SharedDashboardPerson,
	TeamMemberSummary as SharedTeamMemberSummary
} from '../lib/models/person';
import type { TimelineItem } from '../lib/models/timeline';
import {
	ACTIVITY_LEVELS,
	ACCOUNT_ACTIVITY_STREAMS,
	ACCOUNT_INDUSTRIES,
	ACCOUNT_INSIGHT_KINDS,
	ACCOUNT_KINDS,
	ACCOUNT_NEWS_SOURCES,
	ACCOUNT_STAGES,
	type ActivityLevel,
	type AccountKind,
	type AccountIndustry,
	type AccountInsightKind,
	type AccountNewsSource
} from '../lib/types/vocab';

type NonEmptyStringTuple = readonly [string, ...string[]];

export function literalUnion<const Values extends NonEmptyStringTuple>(values: Values) {
	const [first, ...rest] = values;

	return v.union(v.literal(first), ...rest.map((value) => v.literal(value)));
}

export const activityLevelValidator = literalUnion(ACTIVITY_LEVELS);
export const accountStageValidator = literalUnion(ACCOUNT_STAGES);
export const accountKindValidator = literalUnion(ACCOUNT_KINDS);
export const accountIndustryValidator = literalUnion(ACCOUNT_INDUSTRIES);
export const accountActivityStreamValidator = literalUnion(ACCOUNT_ACTIVITY_STREAMS);
export const accountActivityEventKindValidator = v.literal('ask-for-update');
export const accountNewsSourceValidator = literalUnion(ACCOUNT_NEWS_SOURCES);
export const accountInsightKindValidator = literalUnion(ACCOUNT_INSIGHT_KINDS);

export const newBusinessViewValidator = literalUnion([
	DEFAULT_NEW_BUSINESS_VIEW,
	...NEW_BUSINESS_NON_DEFAULT_VIEWS
] as const);
export const renewalsViewValidator = literalUnion([
	DEFAULT_RENEWALS_VIEW,
	...RENEWALS_NON_DEFAULT_VIEWS
] as const);
export const myAccountsViewValidator = literalUnion([
	DEFAULT_MY_ACCOUNTS_VIEW,
	...MY_ACCOUNTS_NON_DEFAULT_VIEWS
] as const);
export const myAccountsDetailTabIdValidator = literalUnion(MY_ACCOUNTS_DETAIL_TAB_IDS);

export type NewBusinessViewValue = NewBusinessView;
export type RenewalsViewValue = RenewalsView;
export type MyAccountsViewValue = MyAccountsView;
export type MyAccountsDetailTabIdValue = MyAccountsDetailTabId;

export const dashboardPersonValidator = v.object({
	key: v.string(),
	name: v.string(),
	avatar: v.string()
});

export const dashboardMeetingValidator = v.object({
	key: v.string(),
	dateIso: v.string()
});

export const dashboardBrandingValidator = v.object({
	logoUrl: v.string(),
	logoAlt: v.string()
});

export const teamMemberValidator = v.object({
	key: v.string(),
	name: v.string(),
	avatar: v.string()
});

export type DashboardPerson = SharedDashboardPerson;
export type DashboardMeeting = SharedDashboardMeeting;
export type TeamMemberSummary = SharedTeamMemberSummary;
export type DashboardBranding = {
	logoUrl: string;
	logoAlt: string;
};

export const myAccountsDetailRefValidator = v.object({
	accountKey: v.string(),
	defaultTab: myAccountsDetailTabIdValidator
});

export const canvasHeroValidator = v.object({
	title: v.string(),
	description: v.optional(v.string()),
	accountNumber: v.optional(v.number())
});

export const fileUploadFieldValidator = v.object({
	sectionId: v.string(),
	uploadLabel: v.optional(v.string()),
	uploadDescription: v.optional(v.string()),
	acceptedFileTypes: v.optional(v.string()),
	allowMultipleFiles: v.optional(v.boolean())
});

export const timelineMarkerValidator = v.union(
	v.object({
		kind: v.literal('dot')
	}),
	v.object({
		kind: v.literal('avatar'),
		person: dashboardPersonValidator
	})
);

export const timelinePresentationValidator = literalUnion(['standard', 'callout'] as const);

export const timelineItemValidator = v.union(
	v.object({
		kind: v.literal('headline'),
		id: v.string(),
		occurredAtIso: v.string(),
		body: v.string(),
		presentation: timelinePresentationValidator,
		marker: timelineMarkerValidator,
		title: v.string()
	}),
	v.object({
		kind: v.literal('actor-action'),
		id: v.string(),
		occurredAtIso: v.string(),
		body: v.string(),
		presentation: timelinePresentationValidator,
		marker: timelineMarkerValidator,
		actor: dashboardPersonValidator,
		action: v.string()
	})
);

export type TimelineItemData = TimelineItem;

export const orgChartNodeRecordValidator = v.object({
	id: v.string(),
	name: v.string(),
	role: v.string(),
	lastContactedByBrokerKey: v.string(),
	lastContactedOnIso: v.string(),
	parentId: v.optional(v.string())
});

export type OrgChartNodeRecord = SharedOrgChartNodeRecord<BrokerKey>;

export const detailRightRailRowValidator = v.union(
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('text'),
		value: v.string()
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('industry'),
		value: accountIndustryValidator,
		accountKey: v.string()
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('account-number'),
		accountNumber: v.number()
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('activity-level'),
		activityLevel: activityLevelValidator
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('person'),
		person: v.union(dashboardPersonValidator, v.null()),
		emptyValue: v.optional(v.string())
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('renewal-date'),
		dateIso: v.optional(v.string()),
		emptyValue: v.optional(v.string())
	})
);

export const detailRightRailHelpfulContactValidator = v.object({
	id: v.string(),
	name: v.string(),
	title: v.string(),
	company: v.string(),
	linkedInUrl: v.string()
});

export const detailRightRailSectionValidator = v.union(
	v.object({
		id: v.string(),
		kind: v.literal('rows'),
		rows: v.array(detailRightRailRowValidator)
	}),
	v.object({
		id: v.string(),
		kind: v.literal('helpful-contacts'),
		title: v.string(),
		contacts: v.array(detailRightRailHelpfulContactValidator)
	})
);

export const detailRightRailDataValidator = v.object({
	sections: v.array(detailRightRailSectionValidator)
});

export const myAccountsFeedItemReadModelValidator = v.union(
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('news'),
		dateIso: v.string(),
		url: v.string()
	}),
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('linkedin'),
		dateIso: v.string(),
		url: v.string()
	}),
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('activity'),
		dateIso: v.string(),
		detail: myAccountsDetailRefValidator
	})
);

export const myAccountsTableRowReadModelValidator = v.object({
	key: v.string(),
	detail: v.union(myAccountsDetailRefValidator, v.null()),
	account: v.string(),
	latestNewsSource: v.union(accountNewsSourceValidator, v.null()),
	latestNews: v.string(),
	lastActivityDescription: v.string(),
	owner: v.union(dashboardPersonValidator, v.null()),
	isReservedInEpic: v.boolean()
});

export const newBusinessRowLastActivityValidator = v.union(
	v.object({
		kind: v.literal('relative'),
		atIso: v.string()
	}),
	v.object({
		kind: v.literal('text'),
		label: v.string()
	})
);

export const accountListRowReadModelValidator = v.object({
	key: v.string(),
	kind: accountKindValidator,
	hasDetail: v.boolean(),
	renewalDate: v.optional(v.string()),
	revenue: v.optional(v.number()),
	probability: v.number(),
	activityLevel: activityLevelValidator,
	account: v.string(),
	industry: accountIndustryValidator,
	stage: v.optional(v.string()),
	lastActivity: newBusinessRowLastActivityValidator,
	owner: v.union(dashboardPersonValidator, v.null())
});
export const accountListFilterDrawerDataValidator = v.object({
	brokers: v.array(dashboardPersonValidator),
	activityLevels: v.array(
		v.object({
			id: activityLevelValidator,
			label: v.string()
		})
	),
	industries: v.array(
		v.object({
			id: accountIndustryValidator,
			label: v.string()
		})
	),
	renewalDates: v.optional(
		v.array(
			v.object({
				id: v.string(),
				label: v.string()
			})
		)
	)
});

export const opportunityTileReadModelValidator = v.object({
	key: v.string(),
	title: v.string(),
	accountNumber: v.number(),
	accountLabel: v.optional(v.string()),
	avatars: v.optional(v.array(v.string())),
	activityLevel: activityLevelValidator
});

export const sinceLastMeetingAccountReadModelValidator = v.object({
	key: v.string(),
	kind: accountKindValidator,
	account: v.string(),
	renewalDate: v.optional(v.string()),
	probability: v.number(),
	activityLevel: activityLevelValidator,
	stage: v.optional(v.string()),
	hasDetail: v.boolean()
});

export const dashboardShellResultValidator = v.object({
	people: v.array(dashboardPersonValidator),
	team: v.array(teamMemberValidator),
	meetings: v.array(dashboardMeetingValidator),
	defaultMeetingKey: v.union(v.string(), v.null()),
	branding: dashboardBrandingValidator
});

export const myAccountsListReadModelValidator = v.object({
	rows: v.array(myAccountsTableRowReadModelValidator),
	newsItems: v.array(myAccountsFeedItemReadModelValidator),
	watchlistItems: v.array(myAccountsFeedItemReadModelValidator)
});

export const myAccountsDetailReadModelValidator = v.object({
	title: v.string(),
	hero: canvasHeroValidator,
	newsItems: v.array(myAccountsFeedItemReadModelValidator),
	activityItems: v.array(timelineItemValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const accountListReadModelValidator = v.object({
	rows: v.array(accountListRowReadModelValidator),
	filterDrawerData: accountListFilterDrawerDataValidator
});

export const accountDetailReadModelValidator = v.object({
	title: v.string(),
	hero: canvasHeroValidator,
	activityItems: v.array(timelineItemValidator),
	orgChartNodes: v.array(orgChartNodeRecordValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const opportunitiesListReadModelValidator = v.object({
	opportunityTiles: v.array(opportunityTileReadModelValidator),
	riskTiles: v.array(opportunityTileReadModelValidator),
	update: fileUploadFieldValidator
});

export const opportunityDetailReadModelValidator = v.object({
	title: v.string(),
	hero: canvasHeroValidator,
	kind: accountInsightKindValidator,
	activityItems: v.array(timelineItemValidator),
	orgChartNodes: v.array(orgChartNodeRecordValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const sinceLastMeetingReadModelValidator = v.object({
	referenceMeetingDateIso: v.string(),
	timelineItems: v.array(timelineItemValidator),
	accounts: v.array(sinceLastMeetingAccountReadModelValidator),
	update: fileUploadFieldValidator
});

export const sinceLastMeetingDetailReadModelValidator = accountDetailReadModelValidator;

export type MyAccountsDetailRef = {
	accountKey: AccountKey;
	defaultTab: MyAccountsDetailTabId;
};

export type MyAccountsFeedItemReadModel =
	| {
			id: string;
			title: string;
			kind: 'news';
			dateIso: IsoDate;
			url: string;
	  }
	| {
			id: string;
			title: string;
			kind: 'linkedin';
			dateIso: IsoDate;
			url: string;
	  }
	| {
			id: string;
			title: string;
			kind: 'activity';
			dateIso: IsoDate;
			detail: MyAccountsDetailRef;
	  };

export type MyAccountsTableRowReadModel = {
	key: AccountKey;
	detail: MyAccountsDetailRef | null;
	account: string;
	latestNewsSource: AccountNewsSource | null;
	latestNews: string;
	lastActivityDescription: string;
	owner: DashboardPerson | null;
	isReservedInEpic: boolean;
};

export type AccountListRowReadModel = {
	key: AccountKey;
	kind: AccountKind;
	hasDetail: boolean;
	renewalDate?: IsoDate;
	revenue?: number;
	probability: number;
	activityLevel: ActivityLevel;
	account: string;
	industry: AccountIndustry;
	stage?: string;
	lastActivity:
		| {
				kind: 'relative';
				atIso: IsoDateTime;
		  }
		| {
				kind: 'text';
				label: string;
		  };
	owner: DashboardPerson | null;
};

export type AccountListFilterDrawerData = {
	brokers: DashboardPerson[];
	activityLevels: {
		id: ActivityLevel;
		label: string;
	}[];
	industries: {
		id: AccountIndustry;
		label: string;
	}[];
	renewalDates?: {
		id: string;
		label: string;
	}[];
};

export type OpportunityTileReadModel = {
	key: InsightKey;
	title: string;
	accountNumber: number;
	accountLabel?: string;
	avatars?: string[];
	activityLevel: ActivityLevel;
};

export type SinceLastMeetingAccountReadModel = AccountSummaryRow & {
	hasDetail: boolean;
};

export type DashboardShellReadModel = {
	people: DashboardPerson[];
	team: TeamMemberSummary[];
	meetings: DashboardMeeting[];
	defaultMeetingKey: MeetingKey | null;
	branding: DashboardBranding;
};

export type MyAccountsListReadModel = {
	rows: MyAccountsTableRowReadModel[];
	newsItems: MyAccountsFeedItemReadModel[];
	watchlistItems: MyAccountsFeedItemReadModel[];
};

export type MyAccountsDetailReadModel = {
	title: string;
	hero: CanvasHeroData;
	newsItems: MyAccountsFeedItemReadModel[];
	activityItems: TimelineItem[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type AccountListReadModel = {
	rows: AccountListRowReadModel[];
	filterDrawerData: AccountListFilterDrawerData;
};

export type AccountDetailReadModel = {
	title: string;
	hero: CanvasHeroData;
	activityItems: TimelineItem[];
	orgChartNodes: OrgChartNodeRecord[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type OpportunitiesListReadModel = {
	opportunityTiles: OpportunityTileReadModel[];
	riskTiles: OpportunityTileReadModel[];
	update: FileUploadFieldData;
};

export type OpportunityDetailReadModel = {
	title: string;
	hero: CanvasHeroData;
	kind: AccountInsightKind;
	activityItems: TimelineItem[];
	orgChartNodes: OrgChartNodeRecord[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type SinceLastMeetingReadModel = {
	referenceMeetingDateIso: IsoDate;
	timelineItems: TimelineItem[];
	accounts: SinceLastMeetingAccountReadModel[];
	update: FileUploadFieldData;
};
