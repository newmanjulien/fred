import type { QueryCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import type { OrgChartNodeRecord as InternalOrgChartNodeRecord } from '../lib/domain/org-chart';
import type { OrgChartNodeRecord as DashboardOrgChartNodeRecord } from '../lib/dashboard/view-models/deal-content';
import {
	parseIsoDate,
	parseIsoDateTime,
	parseOptionalIsoDateTime,
	type IsoDate,
	type IsoDateTime
} from '../lib/types/dates';
import type { BrokerId, DealId, InsightId, MeetingId } from '../lib/types/ids';
import type { BrokerKey, DealKey, InsightKey, MeetingKey } from '../lib/types/keys';
import type {
	ActivityLevel,
	DealActivityStream,
	DealIndustry,
	DealInsightKind,
	DealNewsSource,
	DealStage
} from '../lib/types/vocab';
import type { DashboardMeeting, DashboardPerson } from './validators';

export type BrokerRecordData = {
	id: BrokerId;
	key: BrokerKey;
	name: string;
	avatar: string;
};

export type MeetingRecordData = {
	id: MeetingId;
	key: MeetingKey;
	dateIso: IsoDate;
};

export type DealContextRecordData = {
	summary: string;
	claimedAtIso: IsoDateTime;
	orgChartNodes: InternalOrgChartNodeRecord[];
	helpfulContacts?: {
		id: string;
		name: string;
		title: string;
		company: string;
		linkedInUrl: string;
	}[];
};

export type DealRecordData = {
	id: DealId;
	key: DealKey;
	dealNumber: number;
	industry: DealIndustry;
	dealName: string;
	isReservedInEpic: boolean;
	probability: number;
	stage: DealStage;
	isLikelyOutOfDate: boolean;
	activityLevel: ActivityLevel;
	lastActivityAtIso?: IsoDateTime;
	ownerBrokerId: BrokerId | null;
	collaboratorBrokerIds: BrokerId[];
	context?: DealContextRecordData;
	dashboardFlags: {
		needsSupport: boolean;
		duplicatedWork: boolean;
	};
};

type ActivityMarkerData<BrokerRef extends string = BrokerId> =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'broker-avatar';
			brokerRef: BrokerRef;
	  };

export type ActivityRecordData<BrokerRef extends string = BrokerId> =
	| {
			kind: 'headline';
			id: string;
			dealId: DealId;
			stream: DealActivityStream;
			occurredOnIso: IsoDate;
			body: string;
			marker: ActivityMarkerData<BrokerRef>;
			title: string;
	  }
	| {
			kind: 'actor-action';
			id: string;
			dealId: DealId;
			stream: DealActivityStream;
			occurredOnIso: IsoDate;
			body: string;
			marker: ActivityMarkerData<BrokerRef>;
			actorBrokerRef: BrokerRef;
			action: string;
	  };

export type NewsRecordData = {
	id: string;
	dealId: DealId;
	title: string;
	source: DealNewsSource;
	publishedOnIso: IsoDate;
};

export type InsightRecordData = {
	id: InsightId;
	key: InsightKey;
	dealId: DealId;
	meetingId: MeetingId;
	kind: DealInsightKind;
	title: string;
	ownerBrokerId: BrokerId;
	collaboratorBrokerIds: BrokerId[];
	timeline: ActivityRecordData[];
	orgChartNodes: InternalOrgChartNodeRecord[];
};

type DashboardActivityValue = Doc<'activities'> | Doc<'insights'>['timeline'][number];
type DealContextDocument = NonNullable<Doc<'deals'>['context']>;
type FlatDealContextDocument = Extract<DealContextDocument, { orgChartNodes: unknown[] }>;
type InsightDocument = Doc<'insights'>;
type FlatInsightDocument = Extract<InsightDocument, { orgChartNodes: unknown[] }>;

function requireString(value: unknown, path: string) {
	if (typeof value !== 'string') {
		throw new Error(`Expected string at "${path}".`);
	}

	return value;
}

function toInternalOrgChartNodeRecord(
	node:
		| FlatDealContextDocument['orgChartNodes'][number]
		| FlatInsightDocument['orgChartNodes'][number]
): InternalOrgChartNodeRecord {
	return {
		id: node.id,
		name: node.name,
		role: node.role,
		lastContactedByBrokerId: node.lastContactedByBrokerId,
		lastContactedOnIso: parseIsoDate(
			node.lastContactedOnIso,
			`orgChartNodes["${node.id}"].lastContactedOnIso`
		),
		parentId: node.parentId ?? undefined
	};
}

function toLegacyOrgChartNodeRecords(
	node: unknown,
	path: string,
	parentId?: string
): InternalOrgChartNodeRecord[] {
	if (!node || typeof node !== 'object' || Array.isArray(node)) {
		throw new Error(`Invalid legacy org chart node at "${path}".`);
	}

	const rawNode = node as Record<string, unknown>;
	const id = requireString(rawNode.id, `${path}.id`);
	const directReports = rawNode.directReports;

	if (directReports !== undefined && !Array.isArray(directReports)) {
		throw new Error(`Invalid legacy org chart directReports at "${path}.directReports".`);
	}

	const currentNode: InternalOrgChartNodeRecord = {
		id,
		name: requireString(rawNode.name, `${path}.name`),
		role: requireString(rawNode.role, `${path}.role`),
		lastContactedByBrokerId: requireString(
			rawNode.lastContactedByBrokerId,
			`${path}.lastContactedByBrokerId`
		) as BrokerId,
		lastContactedOnIso: parseIsoDate(
			requireString(rawNode.lastContactedOnIso, `${path}.lastContactedOnIso`),
			`${path}.lastContactedOnIso`
		),
		parentId
	};

	return [
		currentNode,
		...(directReports ?? []).flatMap((childNode, index) =>
			toLegacyOrgChartNodeRecords(childNode, `${path}.directReports[${index}]`, id)
		)
	];
}

function hasFlatOrgChartNodes(context: DealContextDocument): context is FlatDealContextDocument {
	return 'orgChartNodes' in context;
}

function hasFlatInsightOrgChartNodes(insight: InsightDocument): insight is FlatInsightDocument {
	return 'orgChartNodes' in insight;
}

export async function findBrokerRecordByKey(
	ctx: QueryCtx,
	brokerKey: BrokerKey
): Promise<BrokerRecordData | null> {
	const broker = await ctx.db
		.query('brokers')
		.withIndex('by_key', (query) => query.eq('key', brokerKey))
		.unique();

	if (!broker) {
		return null;
	}

	const avatar = await resolveBrokerAvatar(ctx, broker);

	return {
		id: broker._id,
		key: broker.key as BrokerKey,
		name: broker.name,
		avatar
	};
}

export async function requireBrokerRecordByKey(
	ctx: QueryCtx,
	brokerKey: BrokerKey
): Promise<BrokerRecordData> {
	const broker = await findBrokerRecordByKey(ctx, brokerKey);

	if (!broker) {
		throw new Error(`Unknown broker "${brokerKey}".`);
	}

	return broker;
}

export async function toBrokerRecord(
	ctx: QueryCtx,
	broker: Doc<'brokers'>
): Promise<BrokerRecordData> {
	return {
		id: broker._id,
		key: broker.key as BrokerKey,
		name: broker.name,
		avatar: await resolveBrokerAvatar(ctx, broker)
	};
}

export function toDashboardPerson(record: BrokerRecordData): DashboardPerson {
	return {
		key: record.key,
		name: record.name,
		avatar: record.avatar
	};
}

export function toDashboardPeople(records: readonly BrokerRecordData[]): DashboardPerson[] {
	return records.map((record) => toDashboardPerson(record));
}

export function createBrokerKeyByIdMap(
	records: readonly BrokerRecordData[]
): ReadonlyMap<BrokerId, BrokerKey> {
	return new Map(records.map((record) => [record.id, record.key] as const));
}

export function createDashboardPersonByBrokerIdMap(
	records: readonly BrokerRecordData[]
): ReadonlyMap<BrokerId, DashboardPerson> {
	return new Map(records.map((record) => [record.id, toDashboardPerson(record)] as const));
}

export function toDashboardOrgChartNodes(
	nodes: readonly InternalOrgChartNodeRecord[],
	brokerKeyById: ReadonlyMap<BrokerId, BrokerKey>
): DashboardOrgChartNodeRecord[] {
	return nodes.map((node) => {
		const brokerKey = brokerKeyById.get(node.lastContactedByBrokerId);

		if (!brokerKey) {
			throw new Error(`Unknown broker "${node.lastContactedByBrokerId}" in org chart.`);
		}

		return {
			id: node.id,
			name: node.name,
			role: node.role,
			lastContactedByBrokerKey: brokerKey,
			lastContactedOnIso: node.lastContactedOnIso,
			parentId: node.parentId
		};
	});
}

export function toMeetingRecord(meeting: Doc<'meetings'>): MeetingRecordData {
	return {
		id: meeting._id,
		key: meeting.key as MeetingKey,
		dateIso: parseIsoDate(meeting.dateIso, `meetings["${meeting._id}"].dateIso`)
	};
}

export function toDashboardMeeting(record: MeetingRecordData): DashboardMeeting {
	return {
		key: record.key,
		dateIso: record.dateIso
	};
}

export async function listMeetingRecords(ctx: QueryCtx): Promise<MeetingRecordData[]> {
	const meetings = await ctx.db.query('meetings').collect();

	return meetings
		.map((meeting) => toMeetingRecord(meeting))
		.sort((left, right) => right.dateIso.localeCompare(left.dateIso));
}

export async function findMeetingRecordByKey(
	ctx: QueryCtx,
	meetingKey: MeetingKey
): Promise<MeetingRecordData | null> {
	const meeting = await ctx.db
		.query('meetings')
		.withIndex('by_key', (query) => query.eq('key', meetingKey))
		.unique();

	return meeting ? toMeetingRecord(meeting) : null;
}

export async function requireMeetingRecordByKey(
	ctx: QueryCtx,
	meetingKey: MeetingKey
): Promise<MeetingRecordData> {
	const meeting = await findMeetingRecordByKey(ctx, meetingKey);

	if (!meeting) {
		throw new Error(`Unknown meeting "${meetingKey}".`);
	}

	return meeting;
}

export async function findDealDocumentByKey(
	ctx: QueryCtx,
	dealKey: DealKey
): Promise<Doc<'deals'> | null> {
	return ctx.db
		.query('deals')
		.withIndex('by_key', (query) => query.eq('key', dealKey))
		.unique();
}

export async function findInsightDocumentByKey(
	ctx: QueryCtx,
	insightKey: InsightKey
): Promise<Doc<'insights'> | null> {
	return ctx.db
		.query('insights')
		.withIndex('by_key', (query) => query.eq('key', insightKey))
		.unique();
}

async function resolveBrokerAvatar(
	ctx: QueryCtx,
	broker: Doc<'brokers'>
): Promise<DashboardPerson['avatar']> {
	try {
		const avatarUrl = await ctx.storage.getUrl(broker.avatar as Id<'_storage'>);

		return avatarUrl ?? broker.avatar;
	} catch {
		return broker.avatar;
	}
}

export function toDealContextRecord(context: DealContextDocument): DealContextRecordData {
	return {
		summary: context.summary,
		claimedAtIso: parseIsoDateTime(context.claimedAtIso, 'deal.context.claimedAtIso'),
		orgChartNodes: hasFlatOrgChartNodes(context)
			? context.orgChartNodes.map((node) => toInternalOrgChartNodeRecord(node))
			: toLegacyOrgChartNodeRecords(context.orgChartRoot, 'deal.context.orgChartRoot'),
		helpfulContacts: context.helpfulContacts?.map((contact) => ({
			id: contact.id,
			name: contact.name,
			title: contact.title,
			company: contact.company,
			linkedInUrl: contact.linkedInUrl
		}))
	};
}

export function toDealRecord(deal: Doc<'deals'>): DealRecordData {
	return {
		id: deal._id,
		key: deal.key as DealKey,
		dealNumber: deal.dealNumber,
		industry: deal.industry as DealIndustry,
		dealName: deal.dealName,
		isReservedInEpic: deal.isReservedInEpic,
		probability: deal.probability,
		stage: deal.stage as DealStage,
		isLikelyOutOfDate: deal.isLikelyOutOfDate,
		activityLevel: deal.activityLevel as ActivityLevel,
		lastActivityAtIso: parseOptionalIsoDateTime(
			deal.lastActivityAtIso,
			`deals["${deal._id}"].lastActivityAtIso`
		),
		ownerBrokerId: deal.ownerBrokerId ?? null,
		collaboratorBrokerIds: deal.collaboratorBrokerIds,
		context: deal.context ? toDealContextRecord(deal.context) : undefined,
		dashboardFlags: {
			needsSupport: deal.dashboardFlags.needsSupport,
			duplicatedWork: deal.dashboardFlags.duplicatedWork
		}
	};
}

function getActivityLocalId(activity: DashboardActivityValue) {
	if ('id' in activity) {
		return activity.id;
	}

	return `activity-${activity._creationTime}`;
}

function hasActorActivityFields(
	activity: DashboardActivityValue
): activity is DashboardActivityValue & {
	actorBrokerId: BrokerId;
	action: string;
} {
	return 'actorBrokerId' in activity && 'action' in activity;
}

function hasHeadlineActivityFields(
	activity: DashboardActivityValue
): activity is DashboardActivityValue & {
	title: string;
} {
	return 'title' in activity;
}

export function toActivityRecord(activity: DashboardActivityValue): ActivityRecordData {
	const id = getActivityLocalId(activity);
	const marker =
		activity.marker.kind === 'dot'
			? { kind: 'dot' as const }
			: { kind: 'broker-avatar' as const, brokerRef: activity.marker.brokerId };

	const hasActorFields = hasActorActivityFields(activity);
	const hasHeadlineFields = hasHeadlineActivityFields(activity);

	if (hasActorFields === hasHeadlineFields) {
		throw new Error(`Invalid activity shape for "${id}".`);
	}

	if (hasHeadlineFields) {
		return {
			kind: 'headline',
			id,
			dealId: activity.dealId,
			stream: activity.stream as DealActivityStream,
			occurredOnIso: parseIsoDate(activity.occurredOnIso, `activity["${id}"].occurredOnIso`),
			body: activity.body,
			marker,
			title: activity.title
		};
	} else {
		return {
			kind: 'actor-action',
			id,
			dealId: activity.dealId,
			stream: activity.stream as DealActivityStream,
			occurredOnIso: parseIsoDate(activity.occurredOnIso, `activity["${id}"].occurredOnIso`),
			body: activity.body,
			marker,
			actorBrokerRef: activity.actorBrokerId,
			action: activity.action
		};
	}
}

export function toNewsRecord(newsItem: Doc<'news'>): NewsRecordData {
	return {
		id: `news-${newsItem._creationTime}`,
		dealId: newsItem.dealId,
		title: newsItem.title,
		source: newsItem.source as DealNewsSource,
		publishedOnIso: parseIsoDate(newsItem.publishedOnIso, `news["${newsItem._id}"].publishedOnIso`)
	};
}

export function toInsightRecord(insight: InsightDocument): InsightRecordData {
	return {
		id: insight._id,
		key: insight.key as InsightKey,
		dealId: insight.dealId,
		meetingId: insight.meetingId,
		kind: insight.kind as DealInsightKind,
		title: insight.title,
		ownerBrokerId: insight.ownerBrokerId,
		collaboratorBrokerIds: insight.collaboratorBrokerIds,
		timeline: insight.timeline.map((activity) => toActivityRecord(activity)),
		orgChartNodes: hasFlatInsightOrgChartNodes(insight)
			? insight.orgChartNodes.map((node) => toInternalOrgChartNodeRecord(node))
			: toLegacyOrgChartNodeRecords(insight.orgChartRoot, `insights["${insight._id}"].orgChartRoot`)
	};
}
