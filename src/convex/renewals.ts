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
	type NewBusinessDetailReadModel,
	type NewBusinessListReadModel,
	newBusinessDetailReadModelValidator,
	newBusinessListReadModelValidator,
	renewalsViewValidator
} from './validators';

type RowCollections = {
	accountsRows: LeadershipListTableRow[];
	atRiskRows: LeadershipListTableRow[];
	likelyOutOfDateRows: LeadershipListTableRow[];
};

function buildRowCollections(
	accounts: readonly AccountRecordData[],
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>
): RowCollections {
	const likelyOutOfDateAccounts = accounts.filter((account) => account.isLikelyOutOfDate);

	return {
		accountsRows: accounts.map((account) =>
			hasListActivityData(account)
				? toRelativeLastActivityRow(account, peopleByBrokerId)
				: toNoActivityRow(account, peopleByBrokerId)
		),
		atRiskRows: [],
		likelyOutOfDateRows: likelyOutOfDateAccounts.map((account) =>
			hasListActivityData(account)
				? toRelativeLastActivityRow(account, peopleByBrokerId)
				: toNoActivityRow(account, peopleByBrokerId)
		)
	};
}

function resolveRowsForView(view: RenewalsView, collections: RowCollections) {
	return view === 'at-risk'
		? collections.atRiskRows
		: view === 'likely-out-of-date'
			? collections.likelyOutOfDateRows
			: collections.accountsRows;
}

export const getRenewalsList = query({
	args: {
		view: renewalsViewValidator
	},
	returns: newBusinessListReadModelValidator,
	handler: async (ctx, args): Promise<NewBusinessListReadModel> => {
		const selectedView = args.view as RenewalsView;
		const [brokers, accounts] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('accounts').collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const people = toDashboardPeople(brokerRecords);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const accountRecords = accounts.map((account) => toAccountRecord(account)).filter((account) => account.isRenewal);
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
	returns: v.union(newBusinessDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<NewBusinessDetailReadModel | null> => {
		const account = await findAccountDocumentByKey(ctx, args.accountKey as AccountKey);

		if (!account || !toAccountRecord(account).isRenewal) {
			return null;
		}

		return getAccountDetailReadModel(ctx, args.accountKey as AccountKey);
	}
});
