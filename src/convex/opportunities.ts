import { v } from 'convex/values';
import { query } from './_generated/server';
import type { BrokerId } from '../lib/types/ids';
import type { InsightKey, MeetingKey } from '../lib/types/keys';
import {
	type PersonSummaryMap,
	resolveOptionalBrokerPerson,
	toTimelineItem
} from '../lib/dashboard/view-models/account-content';
import {
	buildAccountUploadFieldData
} from '../lib/dashboard/view-models/detail-builders';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '../lib/dashboard/detail/right-rail';
import {
	type AccountRecordData,
	type InsightRecordData,
	createBrokerKeyByIdMap,
	createDashboardPersonByBrokerIdMap,
	findInsightDocumentByKey,
	requireMeetingRecordByKey,
	toBrokerRecord,
	toDashboardOrgChartNodes,
	toAccountRecord,
	toInsightRecord
} from './readModels';
import type { DashboardPerson } from '../lib/models/person';
import {
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
	account: AccountRecordData,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return {
		key: insight.key,
		title: insight.title,
		accountNumber: account.accountNumber,
		accountLabel: account.accountName,
		avatars: getOwnerAvatars(insight, peopleByBrokerId),
		activityLevel: account.activityLevel
	};
}

function toRightRailData(
	account: AccountRecordData,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return toDetailRightRailData([
		toDetailRightRailOverviewSection(
			account,
			resolveOptionalBrokerPerson(peopleByBrokerId, account.ownerBrokerId)
		)
	]);
}

export const getOpportunitiesList = query({
	args: {
		meetingKey: v.string()
	},
	returns: opportunitiesListReadModelValidator,
	handler: async (ctx, args): Promise<OpportunitiesListReadModel> => {
		const [meeting, brokers, accounts] = await Promise.all([
			requireMeetingRecordByKey(ctx, args.meetingKey as MeetingKey),
			ctx.db.query('brokers').collect(),
			ctx.db.query('accounts').collect()
		]);
		const insights = await ctx.db
			.query('insights')
			.withIndex('by_meeting_id', (query) => query.eq('meetingId', meeting.id))
			.collect();
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const accountsById = new Map(accounts.map((account) => [account._id, toAccountRecord(account)] as const));
		const insightRecords = insights.map((insight) => toInsightRecord(insight));

		const opportunityTiles = insightRecords
			.filter((insight) => insight.kind === 'opportunity')
			.map((insight) => {
				const account = accountsById.get(insight.accountId);

				if (!account) {
					throw new Error(`Unknown account "${insight.accountId}" for insight "${insight.id}".`);
				}

				return toTile(insight, account, peopleByBrokerId);
			});
		const riskTiles = insightRecords
			.filter((insight) => insight.kind === 'risk')
			.map((insight) => {
				const account = accountsById.get(insight.accountId);

				if (!account) {
					throw new Error(`Unknown account "${insight.accountId}" for insight "${insight.id}".`);
				}

				return toTile(insight, account, peopleByBrokerId);
			});

		return {
			opportunityTiles,
			riskTiles,
			update: buildAccountUploadFieldData(
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

		const account = await ctx.db.get(insight.accountId);

		if (!account) {
			throw new Error(`Unknown account "${insight.accountId}" for insight "${insight._id}".`);
		}

		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const brokerKeyById = createBrokerKeyByIdMap(brokerRecords);
		const accountRecord = toAccountRecord(account);
		const insightRecord = toInsightRecord(insight);

		return {
			title: insightRecord.title,
			hero: {
				accountNumber: accountRecord.accountNumber,
				title: insightRecord.title
			},
			kind: insightRecord.kind,
			activityItems: insightRecord.timeline.map((activity) => toTimelineItem(activity, peopleByBrokerId)),
			orgChartNodes: toDashboardOrgChartNodes(insightRecord.orgChartNodes, brokerKeyById),
			update: buildAccountUploadFieldData(
				'this opportunity or risk',
				'Upload call notes, screenshots, or procurement docs that add context to'
			),
			rightRail: toRightRailData(accountRecord, peopleByBrokerId)
		};
	}
});
