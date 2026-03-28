import type { QueryCtx } from './_generated/server';
import type { BrokerId } from '../lib/types/ids';
import type { DealKey } from '../lib/types/keys';
import { sortDealActivitiesAscending } from '../lib/dashboard/view-models/deal';
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
	toDetailRightRailHelpfulContactsSection,
	toDetailRightRailOverviewSection,
	toDetailRightRailTimingSection
} from '../lib/dashboard/detail/right-rail';
import {
	type DealRecordData,
	createBrokerKeyByIdMap,
	createDashboardPersonByBrokerIdMap,
	findDealDocumentByKey,
	toActivityRecord,
	toBrokerRecord,
	toDashboardOrgChartNodes,
	toDealRecord
} from './readModels';
import type { DashboardPerson, NewBusinessDetailReadModel } from './validators';

async function resolveDealActivities(
	ctx: QueryCtx,
	deal: NonNullable<Awaited<ReturnType<typeof findDealDocumentByKey>>>
) {
	return ctx.db
		.query('activities')
		.withIndex('by_deal_id_stream_occurred_on_iso', (query) =>
			query.eq('dealId', deal._id).eq('stream', 'deal-detail')
		)
		.collect();
}

function buildDetailReadModel(params: {
	dealRecord: DealRecordData & {
		context: NonNullable<DealRecordData['context']>;
	};
	activities: Awaited<ReturnType<typeof resolveDealActivities>>;
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>;
	brokerKeyById: ReturnType<typeof createBrokerKeyByIdMap>;
}): NewBusinessDetailReadModel {
	const { dealRecord, activities, peopleByBrokerId, brokerKeyById } = params;

	return {
		title: dealRecord.dealName,
		hero: buildDealHero({
			dealNumber: dealRecord.dealNumber,
			dealName: dealRecord.dealName,
			stage: dealRecord.stage,
			probability: dealRecord.probability,
			activityLevel: dealRecord.activityLevel,
			context: dealRecord.context
		}),
		activityItems: sortDealActivitiesAscending(
			activities.map((activity) => toActivityRecord(activity))
		).map((activity) => toTimelineItem(activity, peopleByBrokerId)),
		orgChartNodes: toDashboardOrgChartNodes(dealRecord.context.orgChartNodes, brokerKeyById),
		update: buildDealUploadFieldData(dealRecord.dealName),
		rightRail: toDetailRightRailData([
			toDetailRightRailOverviewSection(
				dealRecord,
				resolveOptionalBrokerPerson(peopleByBrokerId, dealRecord.ownerBrokerId)
			),
			toDetailRightRailTimingSection(dealRecord, dealRecord.context),
			toDetailRightRailHelpfulContactsSection(dealRecord.context)
		])
	};
}

export async function getDealDetailReadModel(
	ctx: QueryCtx,
	dealKey: DealKey
): Promise<NewBusinessDetailReadModel | null> {
	const [deal, brokers] = await Promise.all([
		findDealDocumentByKey(ctx, dealKey),
		ctx.db.query('brokers').collect()
	]);

	if (!deal) {
		return null;
	}

	const activities = await resolveDealActivities(ctx, deal);
	const dealRecord = toDealRecord(deal);

	if (!dealRecord.context) {
		return null;
	}

	const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
	const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
	const brokerKeyById = createBrokerKeyByIdMap(brokerRecords);

	return buildDetailReadModel({
		dealRecord: {
			...dealRecord,
			context: dealRecord.context
		},
		activities,
		peopleByBrokerId,
		brokerKeyById
	});
}
