import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
	activityLevelValidator,
	accountActivityStreamValidator,
	accountIndustryValidator,
	accountInsightKindValidator,
	accountNewsSourceValidator,
	accountStageValidator
} from './validators';

const activityMarkerValidator = v.union(
	v.object({
		kind: v.literal('dot')
	}),
	v.object({
		kind: v.literal('broker-avatar'),
		brokerId: v.id('brokers')
	})
);

const activityBaseFields = {
	accountId: v.id('accounts'),
	meetingId: v.optional(v.id('meetings')),
	stream: accountActivityStreamValidator,
	occurredOnIso: v.string(),
	body: v.string(),
	marker: activityMarkerValidator
};

const headlineActivityFields = {
	...activityBaseFields,
	title: v.string()
};

const actorActivityFields = {
	...activityBaseFields,
	actorBrokerId: v.id('brokers'),
	action: v.string()
};

const activityDocumentValidator = v.union(
	v.object(headlineActivityFields),
	v.object(actorActivityFields)
);

const embeddedActivityValidator = v.union(
	v.object({
		id: v.string(),
		...headlineActivityFields
	}),
	v.object({
		id: v.string(),
		...actorActivityFields
	})
);

const helpfulContactValidator = v.object({
	id: v.string(),
	name: v.string(),
	title: v.string(),
	company: v.string(),
	linkedInUrl: v.string()
});

const internalOrgChartNodeRecordValidator = v.object({
	id: v.string(),
	name: v.string(),
	role: v.string(),
	lastContactedByBrokerId: v.id('brokers'),
	lastContactedOnIso: v.string(),
	parentId: v.optional(v.string())
});

const flatAccountContextValidator = v.object({
	summary: v.string(),
	claimedAtIso: v.string(),
	orgChartNodes: v.array(internalOrgChartNodeRecordValidator),
	helpfulContacts: v.optional(v.array(helpfulContactValidator))
});
const accountContextValidator = flatAccountContextValidator;

const flatInsightValidator = v.object({
	key: v.string(),
	accountId: v.id('accounts'),
	meetingId: v.id('meetings'),
	kind: accountInsightKindValidator,
	title: v.string(),
	ownerBrokerId: v.id('brokers'),
	collaboratorBrokerIds: v.array(v.id('brokers')),
	timeline: v.array(embeddedActivityValidator),
	orgChartNodes: v.array(internalOrgChartNodeRecordValidator)
});
const insightDocumentValidator = flatInsightValidator;

export default defineSchema({
	meetings: defineTable({
		key: v.string(),
		dateIso: v.string()
	})
		.index('by_key', ['key'])
		.index('by_date_iso', ['dateIso']),

	brokers: defineTable({
		key: v.string(),
		name: v.string(),
		avatar: v.string()
	}).index('by_key', ['key']),

	team: defineTable({
		key: v.string(),
		name: v.string(),
		avatar: v.string()
	}).index('by_key', ['key']),

	assets: defineTable({
		key: v.string(),
		storageId: v.id('_storage'),
		alt: v.string()
	}).index('by_key', ['key']),

	accounts: defineTable({
		key: v.string(),
		accountNumber: v.number(),
		industry: accountIndustryValidator,
		accountName: v.string(),
		isRenewal: v.boolean(),
		isReservedInEpic: v.boolean(),
		probability: v.number(),
		stage: accountStageValidator,
		isLikelyOutOfDate: v.boolean(),
		activityLevel: activityLevelValidator,
		lastActivityAtIso: v.optional(v.string()),
		ownerBrokerId: v.optional(v.id('brokers')),
		collaboratorBrokerIds: v.array(v.id('brokers')),
		context: v.optional(accountContextValidator),
		dashboardFlags: v.object({
			needsSupport: v.boolean(),
			duplicatedWork: v.boolean()
		})
	}).index('by_key', ['key']),

	activities: defineTable(activityDocumentValidator)
		.index('by_stream_occurred_on_iso', ['stream', 'occurredOnIso'])
		.index('by_meeting_id_stream_occurred_on_iso', ['meetingId', 'stream', 'occurredOnIso'])
		.index('by_meeting_id_account_id_stream_occurred_on_iso', [
			'meetingId',
			'accountId',
			'stream',
			'occurredOnIso'
		])
		.index('by_account_id_stream_occurred_on_iso', ['accountId', 'stream', 'occurredOnIso']),

	news: defineTable({
		accountId: v.id('accounts'),
		title: v.string(),
		source: accountNewsSourceValidator,
		publishedOnIso: v.string(),
		url: v.optional(v.string())
	})
		.index('by_published_on_iso', ['publishedOnIso'])
		.index('by_account_id_published_on_iso', ['accountId', 'publishedOnIso']),

	insights: defineTable(insightDocumentValidator)
		.index('by_key', ['key'])
		.index('by_account_id', ['accountId'])
		.index('by_kind', ['kind'])
		.index('by_meeting_id', ['meetingId'])
		.index('by_meeting_id_kind', ['meetingId', 'kind'])
		.index('by_account_id_kind', ['accountId', 'kind'])
});
