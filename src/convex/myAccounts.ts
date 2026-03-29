import { v } from 'convex/values';
import { query } from './_generated/server';
import { type BrokerId } from '../lib/types/ids';
import type { BrokerKey, AccountKey } from '../lib/types/keys';
import {
	DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID
} from '../lib/dashboard/routing/my-accounts';
import {
	getLatestAccountActivity,
	getLatestAccountNews,
	sortAccountActivitiesAscending,
	sortAccountNewsDescending
} from '../lib/dashboard/view-models/account';
import {
	type PersonSummaryMap,
	resolveOptionalBrokerPerson,
	toTimelineItem
} from '../lib/dashboard/view-models/account-content';
import {
	buildAccountHero,
	buildAccountUploadFieldData
} from '../lib/dashboard/view-models/detail-builders';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '../lib/dashboard/detail/right-rail';
import {
	type ActivityRecordData,
	type BrokerRecordData,
	type AccountRecordData,
	type NewsRecordData,
	toActivityRecord,
	createDashboardPersonByBrokerIdMap,
	findAccountDocumentByKey,
	toAccountRecord,
	toBrokerRecord,
	toNewsRecord
} from './readModels';
import type { DashboardPerson } from '../lib/models/person';
import {
	type MyAccountsDetailReadModel,
	type MyAccountsListReadModel,
	myAccountsDetailReadModelValidator,
	myAccountsListReadModelValidator,
	myAccountsViewValidator
} from './validators';

export type {
	MyAccountsDetailReadModel,
	MyAccountsDetailRef,
	MyAccountsFeedItemReadModel,
	MyAccountsListReadModel
} from './validators';

type MyAccountsEntryBundle = {
	account: AccountRecordData;
	newsItems: readonly NewsRecordData[];
	activities: readonly ActivityRecordData[];
};

const NO_RECENT_NEWS_LABEL = 'No recent news';
const NO_RECORDED_ACTIVITY_LABEL = 'No recorded activity';

function groupByAccountId<T extends { accountId: string }>(
	records: readonly T[]
): ReadonlyMap<string, readonly T[]> {
	const recordsByAccountId = new Map<string, T[]>();

	for (const record of records) {
		const existingRecords = recordsByAccountId.get(record.accountId);

		if (existingRecords) {
			existingRecords.push(record);
			continue;
		}

		recordsByAccountId.set(record.accountId, [record]);
	}

	return recordsByAccountId;
}

function isAccountOwner(account: Pick<AccountRecordData, 'ownerBrokerId'>, brokerId: BrokerId) {
	return account.ownerBrokerId === brokerId;
}

function isAccountParticipant(
	account: Pick<AccountRecordData, 'ownerBrokerId' | 'collaboratorBrokerIds'>,
	brokerId: BrokerId
) {
	return account.ownerBrokerId === brokerId || account.collaboratorBrokerIds.includes(brokerId);
}

function hasMyAccountsDetailContent(input: Pick<MyAccountsEntryBundle, 'newsItems' | 'activities'>) {
	return input.newsItems.length > 0 || input.activities.length > 0;
}

function isMyAccountsDetailEligible(input: MyAccountsEntryBundle) {
	return Boolean(input.account.context) && hasMyAccountsDetailContent(input);
}

function toMyAccountsNewsItem(newsItem: NewsRecordData) {
	const fallbackUrlBase =
		newsItem.source === 'linkedin'
			? 'https://www.linkedin.com/feed/update/'
			: 'https://news.example.com/articles/';

	return {
		id: newsItem.id,
		title: newsItem.title,
		kind: newsItem.source === 'linkedin' ? 'linkedin' : 'news',
		dateIso: newsItem.publishedOnIso,
		url: newsItem.url ?? `${fallbackUrlBase}${newsItem.id}`
	} as const;
}

function toMyAccountsWatchlistItem(
	entry: MyAccountsEntryBundle,
	activity: ActivityRecordData
) {
	return {
		id: activity.id,
		title: `${entry.account.accountName}: ${activity.kind === 'headline' ? activity.title : activity.action}`,
		kind: 'activity',
		dateIso: activity.occurredOnIso,
		detail: {
			accountKey: entry.account.key,
			defaultTab: 'activity' as const
		}
	} as const;
}

function collectEntries<TItem>(
	entries: readonly MyAccountsEntryBundle[],
	selectItems: (entry: MyAccountsEntryBundle) => readonly TItem[] | null
): TItem[] {
	return entries.reduce<TItem[]>((items, entry) => {
		const selectedItems = selectItems(entry);

		if (selectedItems?.length) {
			items.push(...selectedItems);
		}

		return items;
	}, []);
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

function takeItemsFromSameWeek<TItem>(items: readonly TItem[], getDateIso: (item: TItem) => string) {
	const referenceDateIso = items[0] ? getDateIso(items[0]) : null;

	if (!referenceDateIso) {
		return [];
	}

	const currentWeekItems: TItem[] = [];

	for (const item of items) {
		if (!isInSameWeek(getDateIso(item), referenceDateIso)) {
			break;
		}

		currentWeekItems.push(item);
	}

	return currentWeekItems;
}

function getMyAccountsRowDetailTabId(entry: Pick<MyAccountsEntryBundle, 'newsItems' | 'activities'>) {
	if (entry.newsItems.length > 0) {
		return DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID;
	}

	if (entry.activities.length > 0) {
		return 'activity' as const;
	}

	return DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID;
}

function toTableRow(
	entry: MyAccountsEntryBundle,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	const newsItems = sortAccountNewsDescending(entry.newsItems);
	const activityItems = sortAccountActivitiesAscending(entry.activities);
	const latestNews = getLatestAccountNews(newsItems);
	const latestActivity = getLatestAccountActivity(activityItems);

	const detail = isMyAccountsDetailEligible(entry)
		? {
				accountKey: entry.account.key,
				defaultTab: getMyAccountsRowDetailTabId(entry)
			}
		: null;

	return {
		key: entry.account.key,
		detail,
		account: entry.account.accountName,
		latestNewsSource: latestNews?.source ?? null,
		latestNews: latestNews?.title ?? NO_RECENT_NEWS_LABEL,
		lastActivityDescription: latestActivity?.body ?? NO_RECORDED_ACTIVITY_LABEL,
		owner: resolveOptionalBrokerPerson(peopleByBrokerId, entry.account.ownerBrokerId),
		isReservedInEpic: entry.account.isReservedInEpic
	};
}

function toMyAccountsNewsItems(entries: readonly MyAccountsEntryBundle[]) {
	const sortedNews = sortAccountNewsDescending(
		collectEntries(entries, (entry) => (entry.account.context ? entry.newsItems : null))
	);

	return takeItemsFromSameWeek(sortedNews, (newsItem) => newsItem.publishedOnIso)
		.map((newsItem) => toMyAccountsNewsItem(newsItem));
}

function toMyAccountsWatchlistItems(
	entries: readonly MyAccountsEntryBundle[],
	activeBrokerId: BrokerId
) {
	const sortedActivities = sortFeedItemsDescending(
		collectEntries(entries, (entry) =>
			!isAccountOwner(entry.account, activeBrokerId) && isMyAccountsDetailEligible(entry)
				? entry.activities.map((activity) => toMyAccountsWatchlistItem(entry, activity))
				: null
		)
	);

	return takeItemsFromSameWeek(sortedActivities, (item) => item.dateIso);
}

function buildEntries(input: {
	activeBrokerId: BrokerId;
	accounts: readonly AccountRecordData[];
	newsItems: readonly NewsRecordData[];
	activities: readonly ActivityRecordData[];
}) {
	const newsByAccountId = groupByAccountId(input.newsItems);
	const activitiesByAccountId = groupByAccountId(input.activities);

	return input.accounts.flatMap<MyAccountsEntryBundle>((account) => {
		if (!isAccountParticipant(account, input.activeBrokerId)) {
			return [];
		}

		return [
			{
				account,
				newsItems: newsByAccountId.get(account.id) ?? [],
				activities: activitiesByAccountId.get(account.id) ?? []
			}
		];
	});
}

function createBrokerRecordByKeyMap(
	brokerRecords: readonly BrokerRecordData[]
): ReadonlyMap<BrokerKey, BrokerRecordData> {
	return new Map(brokerRecords.map((brokerRecord) => [brokerRecord.key, brokerRecord] as const));
}

function requireBrokerRecord(
	brokerRecordByKey: ReadonlyMap<BrokerKey, BrokerRecordData>,
	brokerKey: BrokerKey
): BrokerRecordData {
	const broker = brokerRecordByKey.get(brokerKey);

	if (!broker) {
		throw new Error(`Unknown broker "${brokerKey}".`);
	}

	return broker;
}

export const getMyAccountsList = query({
	args: {
		brokerKey: v.string(),
		view: myAccountsViewValidator
	},
	returns: myAccountsListReadModelValidator,
	handler: async (ctx, args): Promise<MyAccountsListReadModel> => {
		const [brokers, accounts, newsItems, activities] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('accounts').collect(),
			ctx.db.query('news').collect(),
			ctx.db
				.query('activities')
				.withIndex('by_stream_occurred_on_iso', (query) => query.eq('stream', 'account-detail'))
				.collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const brokerRecordByKey = createBrokerRecordByKeyMap(brokerRecords);
		const activeBroker = requireBrokerRecord(brokerRecordByKey, args.brokerKey as BrokerKey);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const entries = buildEntries({
			activeBrokerId: activeBroker.id,
			accounts: accounts.map((account) => toAccountRecord(account)),
			newsItems: newsItems.map((newsItem) => toNewsRecord(newsItem)),
			activities: activities.map((activity) => toActivityRecord(activity))
		});

		return {
			rows: entries.map((entry) => toTableRow(entry, peopleByBrokerId)),
			newsItems: toMyAccountsNewsItems(entries),
			watchlistItems: toMyAccountsWatchlistItems(entries, activeBroker.id)
		};
	}
});

export const getMyAccountsDetail = query({
	args: {
		accountKey: v.string(),
		brokerKey: v.string()
	},
	returns: v.union(myAccountsDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<MyAccountsDetailReadModel | null> => {
		const [account, brokers] = await Promise.all([
			findAccountDocumentByKey(ctx, args.accountKey as AccountKey),
			ctx.db.query('brokers').collect()
		]);

		if (!account) {
			return null;
		}

		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const brokerRecordByKey = createBrokerRecordByKeyMap(brokerRecords);
		const activeBroker = requireBrokerRecord(brokerRecordByKey, args.brokerKey as BrokerKey);

		const [newsItems, activities] = await Promise.all([
			ctx.db
				.query('news')
				.withIndex('by_account_id_published_on_iso', (query) =>
					query.eq('accountId', account._id)
				)
				.collect(),
			ctx.db
				.query('activities')
				.withIndex('by_account_id_stream_occurred_on_iso', (query) =>
					query.eq('accountId', account._id).eq('stream', 'account-detail')
				)
				.collect()
		]);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const entry = {
			account: toAccountRecord(account),
			newsItems: newsItems.map((newsItem) => toNewsRecord(newsItem)),
			activities: activities.map((activity) => toActivityRecord(activity))
		} satisfies MyAccountsEntryBundle;

		if (!isAccountParticipant(entry.account, activeBroker.id) || !isMyAccountsDetailEligible(entry)) {
			return null;
		}

		const context = entry.account.context;

		if (!context) {
			return null;
		}

		return {
			title: entry.account.accountName,
			hero: buildAccountHero({
				accountNumber: entry.account.accountNumber,
				accountName: entry.account.accountName,
				isRenewal: entry.account.isRenewal,
				stage: entry.account.stage,
				probability: entry.account.probability,
				activityLevel: entry.account.activityLevel,
				context
			}),
			newsItems: sortAccountNewsDescending(entry.newsItems).map((newsItem) => toMyAccountsNewsItem(newsItem)),
			activityItems: sortAccountActivitiesAscending(entry.activities).map((activity) =>
				toTimelineItem(activity, peopleByBrokerId)
			),
			update: buildAccountUploadFieldData(entry.account.accountName),
			rightRail: toDetailRightRailData([
				toDetailRightRailOverviewSection(
					entry.account,
					resolveOptionalBrokerPerson(peopleByBrokerId, entry.account.ownerBrokerId)
				)
			])
		};
	}
});
