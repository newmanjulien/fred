import { v } from 'convex/values';
import { query } from './_generated/server';
import type { BrokerId } from '../lib/types/ids';
import type { InsightKey, MeetingKey } from '../lib/types/keys';
import {
	type PersonSummaryMap,
	resolveOptionalBrokerPerson,
	toTimelineItem
} from '../lib/dashboard/view-models/deal-content';
import {
	buildDealUploadFieldData
} from '../lib/dashboard/view-models/detail-builders';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '../lib/dashboard/detail/right-rail';
import {
	type DealRecordData,
	type InsightRecordData,
	createBrokerKeyByIdMap,
	createDashboardPersonByBrokerIdMap,
	findInsightDocumentByKey,
	requireMeetingRecordByKey,
	toBrokerRecord,
	toDashboardOrgChartNodes,
	toDealRecord,
	toInsightRecord
} from './readModels';
import {
	type DashboardPerson,
	type OpportunityDetailReadModel,
	type OpportunitiesListReadModel,
	opportunityDetailReadModelValidator,
	opportunitiesListReadModelValidator
} from './validators';

export type {
	DashboardShellReadModel,
	OpportunityDetailReadModel,
	OpportunitiesListReadModel
} from './validators';

type OpportunityTileAvatars = string[];

function getOwnerAvatars(
	insight: Pick<InsightRecordData, 'ownerBrokerId' | 'collaboratorBrokerIds'>,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
): OpportunityTileAvatars {
	const ownerAvatar = peopleByBrokerId.get(insight.ownerBrokerId)?.avatar;

	if (!ownerAvatar) {
		throw new Error(`Unknown owner broker "${insight.ownerBrokerId}".`);
	}

	return [
		ownerAvatar,
		...insight.collaboratorBrokerIds.flatMap((brokerId) => {
			const avatar = peopleByBrokerId.get(brokerId)?.avatar;
			return avatar ? [avatar] : [];
		})
	];
}

function toTile(
	insight: InsightRecordData,
	deal: DealRecordData,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return {
		key: insight.key,
		title: insight.title,
		dealNumber: deal.dealNumber,
		dealLabel: deal.dealName,
		avatars: getOwnerAvatars(insight, peopleByBrokerId),
		activityLevel: deal.activityLevel
	};
}

function toRightRailData(
	deal: DealRecordData,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return toDetailRightRailData([
		toDetailRightRailOverviewSection(
			deal,
			resolveOptionalBrokerPerson(peopleByBrokerId, deal.ownerBrokerId)
		)
	]);
}

export const getOpportunitiesList = query({
	args: {
		meetingKey: v.string()
	},
	returns: opportunitiesListReadModelValidator,
	handler: async (ctx, args): Promise<OpportunitiesListReadModel> => {
		const [meeting, brokers, deals] = await Promise.all([
			requireMeetingRecordByKey(ctx, args.meetingKey as MeetingKey),
			ctx.db.query('brokers').collect(),
			ctx.db.query('deals').collect()
		]);
		const insights = await ctx.db
			.query('insights')
			.withIndex('by_meeting_id', (query) => query.eq('meetingId', meeting.id))
			.collect();
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const dealsById = new Map(deals.map((deal) => [deal._id, toDealRecord(deal)] as const));
		const insightRecords = insights.map((insight) => toInsightRecord(insight));

		const opportunityTiles = insightRecords
			.filter((insight) => insight.kind === 'opportunity')
			.map((insight) => {
				const deal = dealsById.get(insight.dealId);

				if (!deal) {
					throw new Error(`Unknown deal "${insight.dealId}" for insight "${insight.id}".`);
				}

				return toTile(insight, deal, peopleByBrokerId);
			});
		const riskTiles = insightRecords
			.filter((insight) => insight.kind === 'risk')
			.map((insight) => {
				const deal = dealsById.get(insight.dealId);

				if (!deal) {
					throw new Error(`Unknown deal "${insight.dealId}" for insight "${insight.id}".`);
				}

				return toTile(insight, deal, peopleByBrokerId);
			});

		return {
			opportunityTiles,
			riskTiles,
			update: buildDealUploadFieldData(
				'your opportunities and risks',
				'Upload call notes, screenshots, or procurement docs that add context to'
			)
		};
	}
});

export const getOpportunityDetail = query({
	args: {
		insightKey: v.string(),
		meetingKey: v.string()
	},
	returns: v.union(opportunityDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<OpportunityDetailReadModel | null> => {
		const [meeting, insight, brokers] = await Promise.all([
			requireMeetingRecordByKey(ctx, args.meetingKey as MeetingKey),
			findInsightDocumentByKey(ctx, args.insightKey as InsightKey),
			ctx.db.query('brokers').collect()
		]);

		if (!insight) {
			return null;
		}

		if (insight.meetingId !== meeting.id) {
			return null;
		}

		const deal = await ctx.db.get(insight.dealId);

		if (!deal) {
			throw new Error(`Unknown deal "${insight.dealId}" for insight "${insight._id}".`);
		}

		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const brokerKeyById = createBrokerKeyByIdMap(brokerRecords);
		const dealRecord = toDealRecord(deal);
		const insightRecord = toInsightRecord(insight);

		return {
			title: insightRecord.title,
			hero: {
				dealNumber: dealRecord.dealNumber,
				title: insightRecord.title
			},
			kind: insightRecord.kind,
			activityItems: insightRecord.timeline.map((activity) => toTimelineItem(activity, peopleByBrokerId)),
			orgChartNodes: toDashboardOrgChartNodes(insightRecord.orgChartNodes, brokerKeyById),
			update: buildDealUploadFieldData(
				'this opportunity or risk',
				'Upload call notes, screenshots, or procurement docs that add context to'
			),
			rightRail: toRightRailData(dealRecord, peopleByBrokerId)
		};
	}
});
