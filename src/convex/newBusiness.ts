import { v } from 'convex/values';
import { query } from './_generated/server';
import type { BrokerId } from '../lib/types/ids';
import type { DealKey } from '../lib/types/keys';
import { type NewBusinessView } from '../lib/dashboard/routing/new-business';
import {
	type DealRecordData,
	createDashboardPersonByBrokerIdMap,
	findDealDocumentByKey,
	toBrokerRecord,
	toDashboardPeople,
	toDealRecord
} from './readModels';
import { getDealDetailReadModel } from './dealDetail';
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
	newBusinessViewValidator
} from './validators';

export type {
	DashboardShellReadModel,
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
	deals: readonly DealRecordData[],
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>,
	flag: keyof DealRecordData['dashboardFlags']
) {
	return deals
		.filter((deal) => deal.dashboardFlags[flag])
		.map((deal) =>
			hasListActivityData(deal)
				? toRelativeLastActivityRow(deal, peopleByBrokerId)
				: toNoActivityRow(deal, peopleByBrokerId)
		);
}

function buildRowCollections(
	deals: readonly DealRecordData[],
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>
): RowCollections {
	const newBusinessRows = deals.filter(hasListActivityData);
	const noActivityRows = deals.filter((deal) => !hasListActivityData(deal));
	const likelyOutOfDateRows = deals.filter((deal) => deal.isLikelyOutOfDate);

	return {
		newBusinessTableRows: newBusinessRows.map((deal) =>
			toRelativeLastActivityRow(deal, peopleByBrokerId)
		),
		needSupportRows: filterFlaggedRows(deals, peopleByBrokerId, 'needsSupport'),
		duplicatedWorkRows: filterFlaggedRows(deals, peopleByBrokerId, 'duplicatedWork'),
		noActivityTableRows: noActivityRows.map((deal) => toNoActivityRow(deal, peopleByBrokerId)),
		likelyOutOfDateViewRows: likelyOutOfDateRows.map((deal) =>
			hasListActivityData(deal)
				? toRelativeLastActivityRow(deal, peopleByBrokerId)
				: toNoActivityRow(deal, peopleByBrokerId)
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
	handler: async (ctx, args): Promise<NewBusinessListReadModel> => {
		const selectedView = args.view as NewBusinessView;
		const [brokers, deals] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('deals').collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const people = toDashboardPeople(brokerRecords);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const dealRecords = deals.map((deal) => toDealRecord(deal)).filter((deal) => !deal.isRenewal);
		const collections = buildRowCollections(dealRecords, peopleByBrokerId);

		return {
			rows: resolveRowsForView(selectedView, collections),
			filterDrawerData: createLeadershipFilterDrawerData(people, dealRecords)
		};
	}
});

export const getNewBusinessDetail = query({
	args: {
		dealKey: v.string()
	},
	returns: v.union(newBusinessDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<NewBusinessDetailReadModel | null> => {
		const deal = await findDealDocumentByKey(ctx, args.dealKey as DealKey);

		if (!deal || toDealRecord(deal).isRenewal) {
			return null;
		}

		return getDealDetailReadModel(ctx, args.dealKey as DealKey);
	}
});
