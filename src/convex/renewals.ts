import { v } from 'convex/values';
import { query } from './_generated/server';
import type { AccountKey } from '../lib/types/keys';
import { type RenewalsView } from '../lib/dashboard/routing/renewals';
import {
	type AccountRecordData,
	createEmptyAccountSummaryRecord,
	createDashboardPersonByBrokerIdMap,
	findAccountDocumentByKey,
	toBrokerRecord,
	toDashboardPeople,
	toAccountSummaryRecord,
	toAccountRecord
} from './readModels';
import type { AccountSummaryRecordData } from './accountSummary';
import { getAccountDetailReadModel } from './accountDetail';
import {
	createLeadershipFilterDrawerData,
	toLeadershipRow,
	type LeadershipListTableRow
} from './leadershipList';
import {
	type AccountDetailReadModel,
	type AccountListReadModel,
	accountDetailReadModelValidator,
	accountListReadModelValidator,
	renewalsViewValidator
} from './validators';

type RowCollections = {
	accountsRows: LeadershipListTableRow[];
	didntRenewRows: LeadershipListTableRow[];
	next60DaysRows: LeadershipListTableRow[];
	needSupportRows: LeadershipListTableRow[];
	likelyOutOfDateRows: LeadershipListTableRow[];
};

const emptyRowCollections = (): RowCollections => ({
	accountsRows: [],
	didntRenewRows: [],
	next60DaysRows: [],
	needSupportRows: [],
	likelyOutOfDateRows: []
});

function createLeadershipRow(
	account: AccountRecordData,
	accountSummary: AccountSummaryRecordData,
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>
) {
	return toLeadershipRow(account, accountSummary, peopleByBrokerId);
}

function buildRowCollections(
	accounts: readonly AccountRecordData[],
	accountSummariesByAccountId: ReadonlyMap<AccountRecordData['id'], AccountSummaryRecordData>,
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>
): RowCollections {
	const collections = accounts.reduce<RowCollections>((collections, account) => {
		const accountSummary =
			accountSummariesByAccountId.get(account.id) ?? createEmptyAccountSummaryRecord(account.id);
		const row = createLeadershipRow(account, accountSummary, peopleByBrokerId);

		collections.accountsRows.push(row);

		if (account.dashboardFlags.needsSupport) {
			collections.needSupportRows.push(row);
		}

		if (account.isLikelyOutOfDate) {
			collections.likelyOutOfDateRows.push(row);
		}

		return collections;
	}, emptyRowCollections());

	collections.next60DaysRows = collections.accountsRows.slice(0, 5);

	// Keep the placeholder UI populated until the real needs-support logic is finalized.
	if (collections.needSupportRows.length === 0) {
		collections.needSupportRows = collections.accountsRows.slice(0, 1);
	}

	return collections;
}

function resolveRowsForView(view: RenewalsView, collections: RowCollections) {
	const rowsByView: Record<RenewalsView, LeadershipListTableRow[]> = {
		accounts: collections.accountsRows,
		'didnt-renew': collections.didntRenewRows,
		'next-60-days': collections.next60DaysRows,
		'need-support': collections.needSupportRows,
		'likely-out-of-date': collections.likelyOutOfDateRows
	};

	return rowsByView[view];
}

export const getRenewalsList = query({
	args: {
		view: renewalsViewValidator
	},
	returns: accountListReadModelValidator,
	handler: async (ctx, args): Promise<AccountListReadModel> => {
		const selectedView = args.view as RenewalsView;
		const [brokers, accounts, accountSummaries] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('accounts').collect(),
			ctx.db.query('accountSummaries').collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const people = toDashboardPeople(brokerRecords);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const accountSummariesByAccountId = new Map(
			accountSummaries.map((summary) => {
				const record = toAccountSummaryRecord(summary);
				return [record.accountId, record] as const;
			})
		);
		const accountRecords = accounts
			.map((account) => toAccountRecord(account))
			.filter((account) => account.kind === 'renewal');
		const collections = buildRowCollections(
			accountRecords,
			accountSummariesByAccountId,
			peopleByBrokerId
		);

		return {
			rows: resolveRowsForView(selectedView, collections),
			filterDrawerData: createLeadershipFilterDrawerData(people, accountRecords, {
				includeRenewalDates: true
			})
		};
	}
});

export const getRenewalsDetail = query({
	args: {
		accountKey: v.string()
	},
	returns: v.union(accountDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<AccountDetailReadModel | null> => {
		const account = await findAccountDocumentByKey(ctx, args.accountKey as AccountKey);

		if (!account || toAccountRecord(account).kind !== 'renewal') {
			return null;
		}

		return getAccountDetailReadModel(ctx, args.accountKey as AccountKey, {
			timingSection: 'renewal-date'
		});
	}
});
