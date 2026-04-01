import { v } from 'convex/values';
import { query } from './_generated/server';
import type { AccountKey } from '../lib/types/keys';
import { type NewBusinessView } from '../lib/dashboard/routing/new-business';
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
	newBusinessViewValidator
} from './validators';

export type { DashboardShellReadModel, AccountDetailReadModel, AccountListReadModel } from './validators';

type RowCollections = {
	newBusinessTableRows: LeadershipListTableRow[];
	next60DaysRows: LeadershipListTableRow[];
	needSupportRows: LeadershipListTableRow[];
	duplicatedWorkRows: LeadershipListTableRow[];
	noActivityTableRows: LeadershipListTableRow[];
	likelyOutOfDateViewRows: LeadershipListTableRow[];
};

const emptyRowCollections = (): RowCollections => ({
	newBusinessTableRows: [],
	next60DaysRows: [],
	needSupportRows: [],
	duplicatedWorkRows: [],
	noActivityTableRows: [],
	likelyOutOfDateViewRows: []
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

		if (accountSummary.lastAccountDetailActivity.kind !== 'none') {
			collections.newBusinessTableRows.push(row);
		} else {
			collections.noActivityTableRows.push(row);
		}

		if (account.dashboardFlags.needsSupport) {
			collections.needSupportRows.push(row);
		}

		if (account.dashboardFlags.duplicatedWork) {
			collections.duplicatedWorkRows.push(row);
		}

		if (account.isLikelyOutOfDate) {
			collections.likelyOutOfDateViewRows.push(row);
		}

		return collections;
	}, emptyRowCollections());

	collections.next60DaysRows = collections.newBusinessTableRows.slice(0, 5);

	return collections;
}

function resolveRowsForView(view: NewBusinessView, collections: RowCollections) {
	const rowsByView: Record<NewBusinessView, LeadershipListTableRow[]> = {
		accounts: collections.newBusinessTableRows,
		'next-60-days': collections.next60DaysRows,
		'need-support': collections.needSupportRows,
		'duplicated-work': collections.duplicatedWorkRows,
		unassigned: collections.noActivityTableRows,
		'likely-out-of-date': collections.likelyOutOfDateViewRows
	};

	return rowsByView[view];
}

export const getNewBusinessList = query({
	args: {
		view: newBusinessViewValidator
	},
	returns: accountListReadModelValidator,
	handler: async (ctx, args): Promise<AccountListReadModel> => {
		const selectedView = args.view as NewBusinessView;
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
			.filter((account) => account.kind === 'new-business');
		const collections = buildRowCollections(
			accountRecords,
			accountSummariesByAccountId,
			peopleByBrokerId
		);

		return {
			rows: resolveRowsForView(selectedView, collections),
			filterDrawerData: createLeadershipFilterDrawerData(people, accountRecords)
		};
	}
});

export const getNewBusinessDetail = query({
	args: {
		accountKey: v.string()
	},
	returns: v.union(accountDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<AccountDetailReadModel | null> => {
		const account = await findAccountDocumentByKey(ctx, args.accountKey as AccountKey);

		if (!account || toAccountRecord(account).kind !== 'new-business') {
			return null;
		}

		return getAccountDetailReadModel(ctx, args.accountKey as AccountKey);
	}
});
