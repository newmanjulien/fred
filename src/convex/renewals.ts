import { v } from 'convex/values';
import { query } from './_generated/server';
import type { DealKey } from '../lib/types/keys';
import { type RenewalsView } from '../lib/dashboard/routing/renewals';
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
	toNonNavigableRow,
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
	dealsRows: LeadershipListTableRow[];
	atRiskRows: LeadershipListTableRow[];
	likelyOutOfDateRows: LeadershipListTableRow[];
};

function buildRowCollections(
	deals: readonly DealRecordData[],
	peopleByBrokerId: ReturnType<typeof createDashboardPersonByBrokerIdMap>
): RowCollections {
	const likelyOutOfDateDeals = deals.filter((deal) => deal.isLikelyOutOfDate);

	return {
		dealsRows: deals.map((deal) =>
			hasListActivityData(deal)
				? toRelativeLastActivityRow(deal, peopleByBrokerId)
				: toNoActivityRow(deal, peopleByBrokerId)
		),
		atRiskRows: [],
		likelyOutOfDateRows: likelyOutOfDateDeals.map((deal) =>
			toNonNavigableRow(
				hasListActivityData(deal)
					? toRelativeLastActivityRow(deal, peopleByBrokerId)
					: toNoActivityRow(deal, peopleByBrokerId)
			)
		)
	};
}

function resolveRowsForView(view: RenewalsView, collections: RowCollections) {
	return view === 'at-risk'
		? collections.atRiskRows
		: view === 'likely-out-of-date'
			? collections.likelyOutOfDateRows
			: collections.dealsRows;
}

export const getRenewalsList = query({
	args: {
		view: renewalsViewValidator
	},
	returns: newBusinessListReadModelValidator,
	handler: async (ctx, args): Promise<NewBusinessListReadModel> => {
		const selectedView = args.view as RenewalsView;
		const [brokers, deals] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('deals').collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const people = toDashboardPeople(brokerRecords);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const dealRecords = deals.map((deal) => toDealRecord(deal)).filter((deal) => deal.isRenewal);
		const collections = buildRowCollections(dealRecords, peopleByBrokerId);

		return {
			rows: resolveRowsForView(selectedView, collections),
			filterDrawerData: createLeadershipFilterDrawerData(people, dealRecords)
		};
	}
});

export const getRenewalsDetail = query({
	args: {
		dealKey: v.string()
	},
	returns: v.union(newBusinessDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<NewBusinessDetailReadModel | null> => {
		const deal = await findDealDocumentByKey(ctx, args.dealKey as DealKey);

		if (!deal || !toDealRecord(deal).isRenewal) {
			return null;
		}

		return getDealDetailReadModel(ctx, args.dealKey as DealKey);
	}
});
