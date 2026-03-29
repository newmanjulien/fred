import type { QueryCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import type { OrgChartNodeRecord as InternalOrgChartNodeRecord } from '../lib/domain/org-chart';
import type { OrgChartNodeRecord as DashboardOrgChartNodeRecord } from '../lib/models/org-chart';
import {
	parseIsoDate,
	parseIsoDateTime,
	parseOptionalIsoDateTime,
	type IsoDate,
	type IsoDateTime
} from '../lib/types/dates';
import type { BrokerId, AccountId, InsightId, MeetingId, TeamId } from '../lib/types/ids';
import type { BrokerKey, AccountKey, InsightKey, MeetingKey } from '../lib/types/keys';
import type {
	ActivityLevel,
	AccountActivityStream,
	AccountIndustry,
	AccountInsightKind,
	AccountNewsSource,
	AccountStage
} from '../lib/types/vocab';
import type { DashboardMeeting, DashboardPerson, TeamMemberSummary } from '../lib/models/person';
import { hasLegacyOrgChartRoot } from './orgChartMigration';

export type BrokerRecordData = {
	id: BrokerId;
	key: BrokerKey;
	name: string;
	avatar: string;
};

export type TeamRecordData = {
	id: TeamId;
	key: string;
	name: string;
	avatar: string;
};

export type MeetingRecordData = {
	id: MeetingId;
	key: MeetingKey;
	dateIso: IsoDate;
};

export type AccountContextRecordData = {
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

export type AccountRecordData = {
	id: AccountId;
	key: AccountKey;
	accountNumber: number;
	industry: AccountIndustry;
	accountName: string;
	isRenewal: boolean;
	isReservedInEpic: boolean;
	probability: number;
	stage: AccountStage;
	isLikelyOutOfDate: boolean;
	activityLevel: ActivityLevel;
	lastActivityAtIso?: IsoDateTime;
	ownerBrokerId: BrokerId | null;
	collaboratorBrokerIds: BrokerId[];
	context?: AccountContextRecordData;
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
			accountId: AccountId;
			stream: AccountActivityStream;
			occurredOnIso: IsoDate;
			body: string;
			marker: ActivityMarkerData<BrokerRef>;
			title: string;
	  }
	| {
			kind: 'actor-action';
			id: string;
			accountId: AccountId;
			stream: AccountActivityStream;
			occurredOnIso: IsoDate;
			body: string;
			marker: ActivityMarkerData<BrokerRef>;
			actorBrokerRef: BrokerRef;
			action: string;
	  };

export type NewsRecordData = {
	id: string;
	accountId: AccountId;
	title: string;
	source: AccountNewsSource;
	publishedOnIso: IsoDate;
	url?: string;
};

export type InsightRecordData = {
	id: InsightId;
	key: InsightKey;
	accountId: AccountId;
	meetingId: MeetingId;
	kind: AccountInsightKind;
	title: string;
	ownerBrokerId: BrokerId;
	collaboratorBrokerIds: BrokerId[];
	timeline: ActivityRecordData[];
	orgChartNodes: InternalOrgChartNodeRecord[];
};

type DashboardActivityValue = Doc<'activities'> | Doc<'insights'>['timeline'][number];
type AccountContextDocument = NonNullable<Doc<'accounts'>['context']>;
type InsightDocument = Doc<'insights'>;

function toInternalOrgChartNodeRecord(
	node: AccountContextDocument['orgChartNodes'][number] | InsightDocument['orgChartNodes'][number]
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

export async function toTeamRecord(
	ctx: QueryCtx,
	teamMember: Doc<'team'>
): Promise<TeamRecordData> {
	return {
		id: teamMember._id,
		key: teamMember.key,
		name: teamMember.name,
		avatar: await resolveStoredImageUrl(ctx, teamMember.avatar)
	};
}

export function toTeamMemberSummary(record: TeamRecordData): TeamMemberSummary {
	return {
		key: record.key,
		name: record.name,
		avatar: record.avatar
	};
}

export function toTeamMemberSummaries(records: readonly TeamRecordData[]): TeamMemberSummary[] {
	return records.map((record) => toTeamMemberSummary(record));
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

export async function findAccountDocumentByKey(
	ctx: QueryCtx,
	accountKey: AccountKey
): Promise<Doc<'accounts'> | null> {
	return ctx.db
		.query('accounts')
		.withIndex('by_key', (query) => query.eq('key', accountKey))
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
	return resolveStoredImageUrl(ctx, broker.avatar);
}

async function resolveStoredImageUrl(ctx: QueryCtx, storageValue: string): Promise<string> {
	try {
		const avatarUrl = await ctx.storage.getUrl(storageValue as Id<'_storage'>);

		return avatarUrl ?? storageValue;
	} catch {
		return storageValue;
	}
}

export function toAccountContextRecord(context: AccountContextDocument): AccountContextRecordData {
	if (hasLegacyOrgChartRoot(context)) {
		throw new Error(
			'Legacy account org chart detected. Run api.migrations.migrateLegacyOrgCharts before reading account context.'
		);
	}

	return {
		summary: context.summary,
		claimedAtIso: parseIsoDateTime(context.claimedAtIso, 'account.context.claimedAtIso'),
		orgChartNodes: context.orgChartNodes.map((node) => toInternalOrgChartNodeRecord(node)),
		helpfulContacts: context.helpfulContacts?.map((contact) => ({
			id: contact.id,
			name: contact.name,
			title: contact.title,
			company: contact.company,
			linkedInUrl: contact.linkedInUrl
		}))
	};
}

export function toAccountRecord(account: Doc<'accounts'>): AccountRecordData {
	return {
		id: account._id,
		key: account.key as AccountKey,
		accountNumber: account.accountNumber,
		industry: account.industry as AccountIndustry,
		accountName: account.accountName,
		isRenewal: account.isRenewal,
		isReservedInEpic: account.isReservedInEpic,
		probability: account.probability,
		stage: account.stage as AccountStage,
		isLikelyOutOfDate: account.isLikelyOutOfDate,
		activityLevel: account.activityLevel as ActivityLevel,
		lastActivityAtIso: parseOptionalIsoDateTime(
			account.lastActivityAtIso,
			`accounts["${account._id}"].lastActivityAtIso`
		),
		ownerBrokerId: account.ownerBrokerId ?? null,
		collaboratorBrokerIds: account.collaboratorBrokerIds,
		context: account.context ? toAccountContextRecord(account.context) : undefined,
		dashboardFlags: {
			needsSupport: account.dashboardFlags.needsSupport,
			duplicatedWork: account.dashboardFlags.duplicatedWork
		}
	};
}

function getActivityLocalId(activity: DashboardActivityValue) {
	if ('id' in activity) {
		return activity.id;
	}

	return `activity-${activity._creationTime}`;
}

type ActivityRecordBase = Pick<
	ActivityRecordData,
	'id' | 'accountId' | 'stream' | 'occurredOnIso' | 'body' | 'marker'
>;

type NormalizedActivityVariant =
	| {
			kind: 'headline';
			title: string;
	  }
	| {
			kind: 'actor-action';
			actorBrokerRef: BrokerId;
			action: string;
	  };

function createActivityRecordBase(activity: DashboardActivityValue, id: string): ActivityRecordBase {
	return {
		id,
		accountId: activity.accountId,
		stream: activity.stream as AccountActivityStream,
		occurredOnIso: parseIsoDate(activity.occurredOnIso, `activity["${id}"].occurredOnIso`),
		body: activity.body,
		marker:
			activity.marker.kind === 'dot'
				? { kind: 'dot' as const }
				: { kind: 'broker-avatar' as const, brokerRef: activity.marker.brokerId }
	};
}

function normalizeActivityVariant(activity: DashboardActivityValue, id: string): NormalizedActivityVariant {
	if ('title' in activity) {
		return {
			kind: 'headline',
			title: activity.title
		};
	}

	if ('actorBrokerId' in activity && 'action' in activity) {
		return {
			kind: 'actor-action',
			actorBrokerRef: activity.actorBrokerId,
			action: activity.action
		};
	}

	throw new Error(`Invalid activity shape for "${id}".`);
}

export function toActivityRecord(activity: DashboardActivityValue): ActivityRecordData {
	const id = getActivityLocalId(activity);
	const base = createActivityRecordBase(activity, id);
	const variant = normalizeActivityVariant(activity, id);

	if (variant.kind === 'headline') {
		return {
			...base,
			...variant
		};
	}

	return {
		...base,
		...variant
	};
}

export function toNewsRecord(newsItem: Doc<'news'>): NewsRecordData {
	return {
		id: `news-${newsItem._creationTime}`,
		accountId: newsItem.accountId,
		title: newsItem.title,
		source: newsItem.source as AccountNewsSource,
		publishedOnIso: parseIsoDate(newsItem.publishedOnIso, `news["${newsItem._id}"].publishedOnIso`),
		url: newsItem.url
	};
}

export function toInsightRecord(insight: InsightDocument): InsightRecordData {
	if (hasLegacyOrgChartRoot(insight)) {
		throw new Error(
			'Legacy insight org chart detected. Run api.migrations.migrateLegacyOrgCharts before reading insights.'
		);
	}

	return {
		id: insight._id,
		key: insight.key as InsightKey,
		accountId: insight.accountId,
		meetingId: insight.meetingId,
		kind: insight.kind as AccountInsightKind,
		title: insight.title,
		ownerBrokerId: insight.ownerBrokerId,
		collaboratorBrokerIds: insight.collaboratorBrokerIds,
		timeline: insight.timeline.map((activity) => toActivityRecord(activity)),
		orgChartNodes: insight.orgChartNodes.map((node) => toInternalOrgChartNodeRecord(node))
	};
}
