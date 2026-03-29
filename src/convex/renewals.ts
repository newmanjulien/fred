import { v } from 'convex/values';
import { query } from './_generated/server';
import type { AccountKey } from '../lib/types/keys';
import { type RenewalsView } from '../lib/dashboard/routing/renewals';
import {
	type AccountRecordData,
	createDashboardPersonByBrokerIdMap,
	findAccountDocumentByKey,
	toBrokerRecord,
	toDashboardPeople,
	toAccountRecord
} from './readModels';
import { getAccountDetailReadModel } from './accountDetail';
import {
	createLeadershipFilterDrawerData,
	hasListActivityData,
	toNoActivityRow,
	toRelativeLastActivityRow,
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
	likelyOutOfDateRows: LeadershipListTableRow[];
};

const emptyRowCollections = (): RowCollections => ({
	accountsRows: [],
	likelyOutOfDateRows: []
});

function createLeadershipRow(
	account: AccountRecordData,
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>
) {
	return hasListActivityData(account)
		? toRelativeLastActivityRow(account, peopleByBrokerId)
		: toNoActivityRow(account, peopleByBrokerId);
}

function buildRowCollections(
	accounts: readonly AccountRecordData[],
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>
): RowCollections {
	return accounts.reduce<RowCollections>((collections, account) => {
		const row = createLeadershipRow(account, peopleByBrokerId);

		collections.accountsRows.push(row);

		if (account.isLikelyOutOfDate) {
			collections.likelyOutOfDateRows.push(row);
		}

		return collections;
	}, emptyRowCollections());
}

function resolveRowsForView(view: RenewalsView, collections: RowCollections) {
	const rowsByView: Record<RenewalsView, LeadershipListTableRow[]> = {
		accounts: collections.accountsRows,
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
		const [brokers, accounts] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('accounts').collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const people = toDashboardPeople(brokerRecords);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const accountRecords = accounts
			.map((account) => toAccountRecord(account))
			.filter((account) => account.isRenewal);
		const collections = buildRowCollections(accountRecords, peopleByBrokerId);

		return {
			rows: resolveRowsForView(selectedView, collections),
			filterDrawerData: createLeadershipFilterDrawerData(people, accountRecords)
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

		if (!account || !toAccountRecord(account).isRenewal) {
			return null;
		}

		return getAccountDetailReadModel(ctx, args.accountKey as AccountKey);
	}
});
