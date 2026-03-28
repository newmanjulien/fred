import { v } from 'convex/values';
import { query } from './_generated/server';
import { sortDealActivitiesAscending } from '../lib/dashboard/view-models/deal';
import type { DealKey, MeetingKey } from '../lib/types/keys';
import { toTimelineItem } from '../lib/dashboard/view-models/deal-content';
import {
	createDashboardPersonByBrokerIdMap,
	findDealDocumentByKey,
	requireMeetingRecordByKey,
	toActivityRecord,
	toBrokerRecord,
	toDealRecord
} from './readModels';
import { getDealDetailReadModel } from './dealDetail';
import {
	type SinceLastMeetingDetailReadModel,
	type SinceLastMeetingDealReadModel,
	type SinceLastMeetingReadModel,
	sinceLastMeetingDetailReadModelValidator,
	sinceLastMeetingReadModelValidator
} from './validators';

export type {
	SinceLastMeetingDetailReadModel,
	SinceLastMeetingDealReadModel,
	SinceLastMeetingReadModel
} from './validators';

function createDealByIdMap(deals: readonly ReturnType<typeof toDealRecord>[]) {
	return new Map(deals.map((deal) => [deal.id, deal] as const));
}

function toSinceLastMeetingDeals(
	meetingUpdateActivities: readonly ReturnType<typeof toActivityRecord>[],
	dealsById: ReadonlyMap<string, ReturnType<typeof toDealRecord>>
): SinceLastMeetingDealReadModel[] {
	const seenDealIds = new Set<string>();

	return meetingUpdateActivities.flatMap((activity) => {
		if (seenDealIds.has(activity.dealId)) {
			return [];
		}

		const deal = dealsById.get(activity.dealId);

		if (!deal) {
			throw new Error(`Unknown deal id "${activity.dealId}" in meeting update activity.`);
		}

		seenDealIds.add(activity.dealId);

		return [
			{
				key: deal.key,
				deal: deal.dealName,
				probability: deal.probability,
				activityLevel: deal.activityLevel,
				stage: deal.stage,
				hasDetail: Boolean(deal.context)
			}
		];
	});
}

export const getSinceLastMeeting = query({
	args: {
		meetingKey: v.string()
	},
	returns: sinceLastMeetingReadModelValidator,
	handler: async (ctx, args): Promise<SinceLastMeetingReadModel> => {
		const [meeting, brokers, deals] = await Promise.all([
			requireMeetingRecordByKey(ctx, args.meetingKey as MeetingKey),
			ctx.db.query('brokers').collect(),
			ctx.db.query('deals').collect()
		]);
		const activities = await ctx.db
			.query('activities')
			.withIndex('by_meeting_id_stream_occurred_on_iso', (query) =>
				query.eq('meetingId', meeting.id).eq('stream', 'meeting-update')
			)
			.collect();
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const peopleById = createDashboardPersonByBrokerIdMap(brokerRecords);
		const meetingUpdateActivities = sortDealActivitiesAscending(
			activities.map((activity) => toActivityRecord(activity))
		);
		const dealRecords = deals.map((deal) => toDealRecord(deal));

		return {
			referenceMeetingDateIso: meeting.dateIso,
			timelineItems: meetingUpdateActivities.map((activity) => toTimelineItem(activity, peopleById)),
			deals: toSinceLastMeetingDeals(meetingUpdateActivities, createDealByIdMap(dealRecords)),
			update: {
				sectionId: 'update',
				uploadLabel: 'Upload files',
				uploadDescription: "Upload screenshots or any docs with the information we're missing"
			}
		};
	}
});

export const getSinceLastMeetingDetail = query({
	args: {
		meetingKey: v.string(),
		dealKey: v.string()
	},
	returns: v.union(sinceLastMeetingDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<SinceLastMeetingDetailReadModel | null> => {
		const [meeting, deal] = await Promise.all([
			requireMeetingRecordByKey(ctx, args.meetingKey as MeetingKey),
			findDealDocumentByKey(ctx, args.dealKey as DealKey)
		]);

		if (!deal) {
			return null;
		}

		const meetingActivities = await ctx.db
			.query('activities')
			.withIndex('by_meeting_id_deal_id_stream_occurred_on_iso', (query) =>
				query.eq('meetingId', meeting.id).eq('dealId', deal._id).eq('stream', 'meeting-update')
			)
			.collect();

		if (meetingActivities.length === 0) {
			return null;
		}

		return getDealDetailReadModel(ctx, args.dealKey as DealKey);
	}
});
