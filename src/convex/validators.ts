import { v } from 'convex/values';
import {
	type NewBusinessView,
	DEFAULT_NEW_BUSINESS_VIEW,
	NEW_BUSINESS_NON_DEFAULT_VIEWS
} from '../lib/dashboard/routing/new-business';
import {
	DEFAULT_MY_DEALS_VIEW,
	MY_DEALS_DETAIL_TAB_IDS,
	MY_DEALS_NON_DEFAULT_VIEWS,
	type MyDealsDetailTabId,
	type MyDealsView
} from '../lib/dashboard/routing/my-deals';
import type { DetailRightRailData } from '../lib/dashboard/detail/right-rail';
import type { OrgChartNodeRecord as SharedOrgChartNodeRecord } from '../lib/dashboard/view-models/deal-content';
import type { CanvasHeroData } from '../lib/dashboard/ui/detail/CanvasHero.types';
import type { FileUploadFieldData } from '../lib/dashboard/ui/detail/FileUploadField.types';
import type { DealSummaryRow } from '../lib/dashboard/view-models/deal';
import type { TimelineItem } from '../lib/dashboard/view-models/deal-content';
import type { IsoDate, IsoDateTime } from '../lib/types/dates';
import type { BrokerKey, DealKey, InsightKey, MeetingKey } from '../lib/types/keys';
import {
	ACTIVITY_LEVELS,
	DEAL_ACTIVITY_STREAMS,
	DEAL_INDUSTRIES,
	DEAL_INSIGHT_KINDS,
	DEAL_NEWS_SOURCES,
	DEAL_STAGES,
	type ActivityLevel,
	type DealIndustry,
	type DealInsightKind,
	type DealNewsSource
} from '../lib/types/vocab';

type NonEmptyStringTuple = readonly [string, ...string[]];

export function literalUnion<const Values extends NonEmptyStringTuple>(values: Values) {
	const [first, ...rest] = values;

	return v.union(v.literal(first), ...rest.map((value) => v.literal(value)));
}

export const activityLevelValidator = literalUnion(ACTIVITY_LEVELS);
export const dealStageValidator = literalUnion(DEAL_STAGES);
export const dealIndustryValidator = literalUnion(DEAL_INDUSTRIES);
export const dealActivityStreamValidator = literalUnion(DEAL_ACTIVITY_STREAMS);
export const dealNewsSourceValidator = literalUnion(DEAL_NEWS_SOURCES);
export const dealInsightKindValidator = literalUnion(DEAL_INSIGHT_KINDS);

export const newBusinessViewValidator = literalUnion([
	DEFAULT_NEW_BUSINESS_VIEW,
	...NEW_BUSINESS_NON_DEFAULT_VIEWS
] as const);
export const myDealsViewValidator = literalUnion([
	DEFAULT_MY_DEALS_VIEW,
	...MY_DEALS_NON_DEFAULT_VIEWS
] as const);
export const myDealsDetailTabIdValidator = literalUnion(MY_DEALS_DETAIL_TAB_IDS);

export type NewBusinessViewValue = NewBusinessView;
export type MyDealsViewValue = MyDealsView;
export type MyDealsDetailTabIdValue = MyDealsDetailTabId;

export const dashboardPersonValidator = v.object({
	key: v.string(),
	name: v.string(),
	avatar: v.string()
});

export const dashboardMeetingValidator = v.object({
	key: v.string(),
	dateIso: v.string()
});

export type DashboardPerson = {
	key: BrokerKey;
	name: string;
	avatar: string;
};

export type DashboardMeeting = {
	key: MeetingKey;
	dateIso: IsoDate;
};

export const myDealsDetailRefValidator = v.object({
	dealKey: v.string(),
	defaultTab: myDealsDetailTabIdValidator
});

export const canvasHeroValidator = v.object({
	title: v.string(),
	description: v.optional(v.string()),
	dealNumber: v.optional(v.number())
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

export const timelineItemValidator = v.union(
	v.object({
		kind: v.literal('headline'),
		id: v.string(),
		occurredOnIso: v.string(),
		body: v.string(),
		marker: timelineMarkerValidator,
		title: v.string()
	}),
	v.object({
		kind: v.literal('actor-action'),
		id: v.string(),
		occurredOnIso: v.string(),
		body: v.string(),
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
		value: dealIndustryValidator,
		dealKey: v.string()
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('deal-number'),
		dealNumber: v.number()
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

export const myDealsFeedItemReadModelValidator = v.union(
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('news'),
		dateIso: v.string()
	}),
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('linkedin'),
		dateIso: v.string()
	}),
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('activity'),
		dateIso: v.string(),
		detail: myDealsDetailRefValidator
	})
);

export const myDealsTableRowReadModelValidator = v.object({
	key: v.string(),
	detail: v.union(myDealsDetailRefValidator, v.null()),
	deal: v.string(),
	latestNewsSource: v.union(dealNewsSourceValidator, v.null()),
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

export const newBusinessTableRowReadModelValidator = v.object({
	key: v.string(),
	hasDetail: v.boolean(),
	probability: v.number(),
	activityLevel: activityLevelValidator,
	deal: v.string(),
	stage: v.string(),
	lastActivity: newBusinessRowLastActivityValidator,
	owner: v.union(dashboardPersonValidator, v.null())
});

export const newBusinessFilterDrawerDataValidator = v.object({
	brokers: v.array(dashboardPersonValidator),
	activityLevels: v.array(
		v.object({
			id: activityLevelValidator,
			label: v.string()
		})
	),
	industries: v.array(
		v.object({
			id: dealIndustryValidator,
			label: v.string()
		})
	)
});

export const opportunityTileReadModelValidator = v.object({
	key: v.string(),
	title: v.string(),
	dealNumber: v.number(),
	dealLabel: v.optional(v.string()),
	avatars: v.optional(v.array(v.string())),
	activityLevel: activityLevelValidator
});

export const sinceLastMeetingDealReadModelValidator = v.object({
	key: v.string(),
	deal: v.string(),
	probability: v.number(),
	activityLevel: activityLevelValidator,
	stage: v.string(),
	hasDetail: v.boolean()
});

export const dashboardShellResultValidator = v.object({
	people: v.array(dashboardPersonValidator),
	meetings: v.array(dashboardMeetingValidator),
	defaultMeetingKey: v.union(v.string(), v.null())
});

export const myDealsListReadModelValidator = v.object({
	rows: v.array(myDealsTableRowReadModelValidator),
	newsItems: v.array(myDealsFeedItemReadModelValidator),
	watchlistItems: v.array(myDealsFeedItemReadModelValidator)
});

export const myDealsDetailReadModelValidator = v.object({
	title: v.string(),
	hero: canvasHeroValidator,
	newsItems: v.array(myDealsFeedItemReadModelValidator),
	activityItems: v.array(timelineItemValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const newBusinessListReadModelValidator = v.object({
	rows: v.array(newBusinessTableRowReadModelValidator),
	filterDrawerData: newBusinessFilterDrawerDataValidator
});

export const newBusinessDetailReadModelValidator = v.object({
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
	kind: dealInsightKindValidator,
	activityItems: v.array(timelineItemValidator),
	orgChartNodes: v.array(orgChartNodeRecordValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const sinceLastMeetingReadModelValidator = v.object({
	referenceMeetingDateIso: v.string(),
	timelineItems: v.array(timelineItemValidator),
	deals: v.array(sinceLastMeetingDealReadModelValidator),
	update: fileUploadFieldValidator
});

export const sinceLastMeetingDetailReadModelValidator = newBusinessDetailReadModelValidator;

export type MyDealsDetailRef = {
	dealKey: DealKey;
	defaultTab: MyDealsDetailTabId;
};

export type MyDealsFeedItemReadModel =
	| {
			id: string;
			title: string;
			kind: 'news';
			dateIso: IsoDate;
	  }
	| {
			id: string;
			title: string;
			kind: 'linkedin';
			dateIso: IsoDate;
	  }
	| {
			id: string;
			title: string;
			kind: 'activity';
			dateIso: IsoDate;
			detail: MyDealsDetailRef;
	  };

export type MyDealsTableRowReadModel = {
	key: DealKey;
	detail: MyDealsDetailRef | null;
	deal: string;
	latestNewsSource: DealNewsSource | null;
	latestNews: string;
	lastActivityDescription: string;
	owner: DashboardPerson | null;
	isReservedInEpic: boolean;
};

export type NewBusinessTableRowReadModel = {
	key: DealKey;
	hasDetail: boolean;
	probability: number;
	activityLevel: ActivityLevel;
	deal: string;
	stage: string;
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

export type NewBusinessFilterDrawerData = {
	brokers: DashboardPerson[];
	activityLevels: {
		id: ActivityLevel;
		label: string;
	}[];
	industries: {
		id: DealIndustry;
		label: string;
	}[];
};

export type OpportunityTileReadModel = {
	key: InsightKey;
	title: string;
	dealNumber: number;
	dealLabel?: string;
	avatars?: string[];
	activityLevel: ActivityLevel;
};

export type SinceLastMeetingDealReadModel = DealSummaryRow & {
	hasDetail: boolean;
};

export type DashboardShellReadModel = {
	people: DashboardPerson[];
	meetings: DashboardMeeting[];
	defaultMeetingKey: MeetingKey | null;
};

export type MyDealsListReadModel = {
	rows: MyDealsTableRowReadModel[];
	newsItems: MyDealsFeedItemReadModel[];
	watchlistItems: MyDealsFeedItemReadModel[];
};

export type MyDealsDetailReadModel = {
	title: string;
	hero: CanvasHeroData;
	newsItems: MyDealsFeedItemReadModel[];
	activityItems: TimelineItem[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type NewBusinessListReadModel = {
	rows: NewBusinessTableRowReadModel[];
	filterDrawerData: NewBusinessFilterDrawerData;
};

export type NewBusinessDetailReadModel = {
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
	kind: DealInsightKind;
	activityItems: TimelineItem[];
	orgChartNodes: OrgChartNodeRecord[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type SinceLastMeetingReadModel = {
	referenceMeetingDateIso: IsoDate;
	timelineItems: TimelineItem[];
	deals: SinceLastMeetingDealReadModel[];
	update: FileUploadFieldData;
};

export type SinceLastMeetingDetailReadModel = NewBusinessDetailReadModel;
