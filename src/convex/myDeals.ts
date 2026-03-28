import { v } from 'convex/values';
import { query } from './_generated/server';
import { type BrokerId } from '../lib/types/ids';
import type { BrokerKey, DealKey } from '../lib/types/keys';
import {
	DEFAULT_MY_DEALS_DETAIL_TAB_ID
} from '../lib/dashboard/routing/my-deals';
import {
	getLatestDealActivity,
	getLatestDealNews,
	sortDealActivitiesAscending,
	sortDealNewsDescending
} from '../lib/dashboard/view-models/deal';
import {
	type PersonSummaryMap,
	resolveOptionalBrokerPerson,
	toTimelineItem
} from '../lib/dashboard/view-models/deal-content';
import {
	buildDealHero,
	buildDealUploadFieldData
} from '../lib/dashboard/view-models/detail-builders';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '../lib/dashboard/detail/right-rail';
import {
	type ActivityRecordData,
	type BrokerRecordData,
	type DealRecordData,
	type NewsRecordData,
	toActivityRecord,
	createDashboardPersonByBrokerIdMap,
	findDealDocumentByKey,
	toDealRecord,
	toBrokerRecord,
	toNewsRecord
} from './readModels';
import {
	type DashboardPerson,
	type MyDealsDetailReadModel,
	type MyDealsListReadModel,
	myDealsDetailReadModelValidator,
	myDealsListReadModelValidator,
	myDealsViewValidator
} from './validators';

export type {
	MyDealsDetailReadModel,
	MyDealsDetailRef,
	MyDealsFeedItemReadModel,
	MyDealsListReadModel
} from './validators';

type MyDealsEntryBundle = {
	deal: DealRecordData;
	newsItems: readonly NewsRecordData[];
	activities: readonly ActivityRecordData[];
};

const NO_RECENT_NEWS_LABEL = 'No recent news';
const NO_RECORDED_ACTIVITY_LABEL = 'No recorded activity';

function groupByDealId<T extends { dealId: string }>(
	records: readonly T[]
): ReadonlyMap<string, readonly T[]> {
	const recordsByDealId = new Map<string, T[]>();

	for (const record of records) {
		const existingRecords = recordsByDealId.get(record.dealId);

		if (existingRecords) {
			existingRecords.push(record);
			continue;
		}

		recordsByDealId.set(record.dealId, [record]);
	}

	return recordsByDealId;
}

function isDealOwner(deal: Pick<DealRecordData, 'ownerBrokerId'>, brokerId: BrokerId) {
	return deal.ownerBrokerId === brokerId;
}

function isDealParticipant(
	deal: Pick<DealRecordData, 'ownerBrokerId' | 'collaboratorBrokerIds'>,
	brokerId: BrokerId
) {
	return deal.ownerBrokerId === brokerId || deal.collaboratorBrokerIds.includes(brokerId);
}

function hasMyDealsDetailContent(input: Pick<MyDealsEntryBundle, 'newsItems' | 'activities'>) {
	return input.newsItems.length > 0 || input.activities.length > 0;
}

function isMyDealsDetailEligible(input: MyDealsEntryBundle) {
	return Boolean(input.deal.context) && hasMyDealsDetailContent(input);
}

function toMyDealsNewsItem(newsItem: NewsRecordData) {
	return {
		id: newsItem.id,
		title: newsItem.title,
		kind: newsItem.source === 'linkedin' ? 'linkedin' : 'news',
		dateIso: newsItem.publishedOnIso
	} as const;
}

function toMyDealsWatchlistItem(
	entry: MyDealsEntryBundle,
	activity: ActivityRecordData
) {
	return {
		id: activity.id,
		title: `${entry.deal.dealName}: ${activity.kind === 'headline' ? activity.title : activity.action}`,
		kind: 'activity',
		dateIso: activity.occurredOnIso,
		detail: {
			dealKey: entry.deal.key,
			defaultTab: 'activity' as const
		}
	} as const;
}

function toUtcIsoDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

function getWeekStartIso(isoDate: string) {
	const date = new Date(`${isoDate}T00:00:00Z`);
	const day = date.getUTCDay();
	const daysSinceMonday = day === 0 ? 6 : day - 1;

	date.setUTCDate(date.getUTCDate() - daysSinceMonday);

	return toUtcIsoDate(date);
}

function isInSameWeek(leftIso: string, rightIso: string) {
	return getWeekStartIso(leftIso) === getWeekStartIso(rightIso);
}

function sortFeedItemsDescending<T extends { id: string; dateIso: string }>(items: readonly T[]) {
	return [...items].sort((left, right) => {
		const dateComparison = right.dateIso.localeCompare(left.dateIso);

		if (dateComparison !== 0) {
			return dateComparison;
		}

		return left.id.localeCompare(right.id);
	});
}

function getMyDealsRowDetailTabId(entry: Pick<MyDealsEntryBundle, 'newsItems' | 'activities'>) {
	if (entry.newsItems.length > 0) {
		return DEFAULT_MY_DEALS_DETAIL_TAB_ID;
	}

	if (entry.activities.length > 0) {
		return 'activity' as const;
	}

	return DEFAULT_MY_DEALS_DETAIL_TAB_ID;
}

function toTableRow(
	entry: MyDealsEntryBundle,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	const newsItems = sortDealNewsDescending(entry.newsItems);
	const activityItems = sortDealActivitiesAscending(entry.activities);
	const latestNews = getLatestDealNews(newsItems);
	const latestActivity = getLatestDealActivity(activityItems);

	const detail = isMyDealsDetailEligible(entry)
		? {
				dealKey: entry.deal.key,
				defaultTab: getMyDealsRowDetailTabId(entry)
			}
		: null;

	return {
		key: entry.deal.key,
		detail,
		deal: entry.deal.dealName,
		latestNewsSource: latestNews?.source ?? null,
		latestNews: latestNews?.title ?? NO_RECENT_NEWS_LABEL,
		lastActivityDescription: latestActivity?.body ?? NO_RECORDED_ACTIVITY_LABEL,
		owner: resolveOptionalBrokerPerson(peopleByBrokerId, entry.deal.ownerBrokerId),
		isReservedInEpic: entry.deal.isReservedInEpic
	};
}

function toMyDealsNewsItems(entries: readonly MyDealsEntryBundle[]) {
	const sortedNews = sortDealNewsDescending(
		entries.flatMap((entry) => (entry.deal.context ? [...entry.newsItems] : []))
	);
	const referencePublishedOnIso = sortedNews[0]?.publishedOnIso;

	if (!referencePublishedOnIso) {
		return [];
	}

	return sortedNews
		.filter((newsItem) => isInSameWeek(newsItem.publishedOnIso, referencePublishedOnIso))
		.map((newsItem) => toMyDealsNewsItem(newsItem));
}

function toMyDealsWatchlistItems(
	entries: readonly MyDealsEntryBundle[],
	activeBrokerId: BrokerId
) {
	const sortedActivities = sortFeedItemsDescending(
		entries.flatMap((entry) =>
			!isDealOwner(entry.deal, activeBrokerId) && isMyDealsDetailEligible(entry)
				? entry.activities.map((activity) => toMyDealsWatchlistItem(entry, activity))
				: []
		)
	);
	const referenceDateIso = sortedActivities[0]?.dateIso;

	if (!referenceDateIso) {
		return [];
	}

	return sortedActivities.filter((item) => isInSameWeek(item.dateIso, referenceDateIso));
}

function buildEntries(input: {
	activeBrokerId: BrokerId;
	deals: readonly DealRecordData[];
	newsItems: readonly NewsRecordData[];
	activities: readonly ActivityRecordData[];
}) {
	const newsByDealId = groupByDealId(input.newsItems);
	const activitiesByDealId = groupByDealId(input.activities);

	return input.deals.flatMap<MyDealsEntryBundle>((deal) => {
		if (!isDealParticipant(deal, input.activeBrokerId)) {
			return [];
		}

		return [
			{
				deal,
				newsItems: newsByDealId.get(deal.id) ?? [],
				activities: activitiesByDealId.get(deal.id) ?? []
			}
		];
	});
}

function requireBrokerRecord(
	brokerRecords: readonly BrokerRecordData[],
	brokerKey: BrokerKey
): BrokerRecordData {
	const broker = brokerRecords.find((record) => record.key === brokerKey);

	if (!broker) {
		throw new Error(`Unknown broker "${brokerKey}".`);
	}

	return broker;
}

export const getMyDealsList = query({
	args: {
		brokerKey: v.string(),
		view: myDealsViewValidator
	},
	returns: myDealsListReadModelValidator,
	handler: async (ctx, args): Promise<MyDealsListReadModel> => {
		const [brokers, deals, newsItems, activities] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('deals').collect(),
			ctx.db.query('news').collect(),
			ctx.db
				.query('activities')
				.withIndex('by_stream_occurred_on_iso', (query) => query.eq('stream', 'deal-detail'))
				.collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const activeBroker = requireBrokerRecord(brokerRecords, args.brokerKey as BrokerKey);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const entries = buildEntries({
			activeBrokerId: activeBroker.id,
			deals: deals.map((deal) => toDealRecord(deal)),
			newsItems: newsItems.map((newsItem) => toNewsRecord(newsItem)),
			activities: activities.map((activity) => toActivityRecord(activity))
		});

		return {
			rows: entries.map((entry) => toTableRow(entry, peopleByBrokerId)),
			newsItems: toMyDealsNewsItems(entries),
			watchlistItems: toMyDealsWatchlistItems(entries, activeBroker.id)
		};
	}
});

export const getMyDealsDetail = query({
	args: {
		dealKey: v.string(),
		brokerKey: v.string(),
		view: myDealsViewValidator
	},
	returns: v.union(myDealsDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<MyDealsDetailReadModel | null> => {
		const [deal, brokers] = await Promise.all([
			findDealDocumentByKey(ctx, args.dealKey as DealKey),
			ctx.db.query('brokers').collect()
		]);

		if (!deal) {
			return null;
		}

		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const activeBroker = requireBrokerRecord(brokerRecords, args.brokerKey as BrokerKey);

		const [newsItems, activities] = await Promise.all([
			ctx.db
				.query('news')
				.withIndex('by_deal_id_published_on_iso', (query) =>
					query.eq('dealId', deal._id)
				)
				.collect(),
			ctx.db
				.query('activities')
				.withIndex('by_deal_id_stream_occurred_on_iso', (query) =>
					query.eq('dealId', deal._id).eq('stream', 'deal-detail')
				)
				.collect()
		]);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const entry = {
			deal: toDealRecord(deal),
			newsItems: newsItems.map((newsItem) => toNewsRecord(newsItem)),
			activities: activities.map((activity) => toActivityRecord(activity))
		} satisfies MyDealsEntryBundle;

		if (!isDealParticipant(entry.deal, activeBroker.id) || !isMyDealsDetailEligible(entry)) {
			return null;
		}

		const context = entry.deal.context;

		if (!context) {
			return null;
		}

		return {
			title: entry.deal.dealName,
			hero: buildDealHero({
				dealNumber: entry.deal.dealNumber,
				dealName: entry.deal.dealName,
				stage: entry.deal.stage,
				probability: entry.deal.probability,
				activityLevel: entry.deal.activityLevel,
				context
			}),
			newsItems: sortDealNewsDescending(entry.newsItems).map((newsItem) => toMyDealsNewsItem(newsItem)),
			activityItems: sortDealActivitiesAscending(entry.activities).map((activity) =>
				toTimelineItem(activity, peopleByBrokerId)
			),
			update: buildDealUploadFieldData(entry.deal.dealName),
			rightRail: toDetailRightRailData([
				toDetailRightRailOverviewSection(
					entry.deal,
					resolveOptionalBrokerPerson(peopleByBrokerId, entry.deal.ownerBrokerId)
				)
			])
		};
	}
});
