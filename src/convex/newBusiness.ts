import { v } from 'convex/values';
import { query } from './_generated/server';
import type { AccountKey } from '../lib/types/keys';
import { type NewBusinessView } from '../lib/dashboard/routing/new-business';
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
	newBusinessDetailReadModelValidator,
	newBusinessListReadModelValidator,
	newBusinessViewValidator
} from './validators';

export type {
	DashboardShellReadModel,
	AccountDetailReadModel,
	AccountListReadModel,
	NewBusinessDetailReadModel,
	NewBusinessListReadModel
} from './validators';

type RowCollections = {
	newBusinessTableRows: LeadershipListTableRow[];
	needSupportRows: LeadershipListTableRow[];
	duplicatedWorkRows: LeadershipListTableRow[];
	noActivityTableRows: LeadershipListTableRow[];
	likelyOutOfDateViewRows: LeadershipListTableRow[];
}

function filterFlaggedRows(
	accounts: readonly AccountRecordData[],
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>,
	flag: keyof AccountRecordData['dashboardFlags']
) {
	return accounts
		.filter((account) => account.dashboardFlags[flag])
		.map((account) =>
			hasListActivityData(account)
				? toRelativeLastActivityRow(account, peopleByBrokerId)
				: toNoActivityRow(account, peopleByBrokerId)
		);
}

function buildRowCollections(
	accounts: readonly AccountRecordData[],
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>
): RowCollections {
	const newBusinessRows = accounts.filter(hasListActivityData);
	const noActivityRows = accounts.filter((account) => !hasListActivityData(account));
	const likelyOutOfDateRows = accounts.filter((account) => account.isLikelyOutOfDate);

	return {
		newBusinessTableRows: newBusinessRows.map((account) =>
			toRelativeLastActivityRow(account, peopleByBrokerId)
		),
		needSupportRows: filterFlaggedRows(accounts, peopleByBrokerId, 'needsSupport'),
		duplicatedWorkRows: filterFlaggedRows(accounts, peopleByBrokerId, 'duplicatedWork'),
		noActivityTableRows: noActivityRows.map((account) => toNoActivityRow(account, peopleByBrokerId)),
		likelyOutOfDateViewRows: likelyOutOfDateRows.map((account) =>
			hasListActivityData(account)
				? toRelativeLastActivityRow(account, peopleByBrokerId)
				: toNoActivityRow(account, peopleByBrokerId)
		)
	};
}

function resolveRowsForView(view: NewBusinessView, collections: RowCollections) {
	return view === 'need-support'
		? collections.needSupportRows
		: view === 'duplicated-work'
			? collections.duplicatedWorkRows
			: view === 'unassigned'
				? collections.noActivityTableRows
				: view === 'likely-out-of-date'
					? collections.likelyOutOfDateViewRows
					: collections.newBusinessTableRows;
}

export const getNewBusinessList = query({
	args: {
		view: newBusinessViewValidator
	},
	returns: newBusinessListReadModelValidator,
	handler: async (ctx, args): Promise<AccountListReadModel> => {
		const selectedView = args.view as NewBusinessView;
		const [brokers, accounts] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('accounts').collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const people = toDashboardPeople(brokerRecords);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const accountRecords = accounts.map((account) => toAccountRecord(account)).filter((account) => !account.isRenewal);
		const collections = buildRowCollections(accountRecords, peopleByBrokerId);

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
	returns: v.union(newBusinessDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<AccountDetailReadModel | null> => {
		const account = await findAccountDocumentByKey(ctx, args.accountKey as AccountKey);

		if (!account || toAccountRecord(account).isRenewal) {
			return null;
		}

		return getAccountDetailReadModel(ctx, args.accountKey as AccountKey);
	}
});
