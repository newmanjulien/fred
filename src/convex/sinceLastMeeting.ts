import { v } from 'convex/values';
import { query } from './_generated/server';
import { sortAccountActivitiesAscending } from '../lib/dashboard/view-models/account';
import type { AccountKey, MeetingKey } from '../lib/types/keys';
import { toTimelineItem } from '../lib/dashboard/view-models/account-content';
import {
	createDashboardPersonByBrokerIdMap,
	findAccountDocumentByKey,
	requireMeetingRecordByKey,
	toActivityRecord,
	toBrokerRecord,
	toAccountRecord
} from './readModels';
import { getAccountDetailReadModel } from './accountDetail';
import {
	type AccountDetailReadModel,
	type SinceLastMeetingDetailReadModel,
	type SinceLastMeetingAccountReadModel,
	type SinceLastMeetingReadModel,
	sinceLastMeetingDetailReadModelValidator,
	sinceLastMeetingReadModelValidator
} from './validators';

export type {
	AccountDetailReadModel,
	SinceLastMeetingDetailReadModel,
	SinceLastMeetingAccountReadModel,
	SinceLastMeetingReadModel
} from './validators';

function createAccountByIdMap(accounts: readonly ReturnType<typeof toAccountRecord>[]) {
	return new Map(accounts.map((account) => [account.id, account] as const));
}

function toSinceLastMeetingAccounts(
	meetingUpdateActivities: readonly ReturnType<typeof toActivityRecord>[],
	accountsById: ReadonlyMap<string, ReturnType<typeof toAccountRecord>>
): SinceLastMeetingAccountReadModel[] {
	const seenAccountIds = new Set<string>();

	return meetingUpdateActivities.flatMap((activity) => {
		if (seenAccountIds.has(activity.accountId)) {
			return [];
		}

		const account = accountsById.get(activity.accountId);

		if (!account) {
			throw new Error(`Unknown account id "${activity.accountId}" in meeting update activity.`);
		}

		seenAccountIds.add(activity.accountId);

		return [
			{
				key: account.key,
				account: account.accountName,
				probability: account.probability,
				activityLevel: account.activityLevel,
				stage: account.stage,
				hasDetail: Boolean(account.context)
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
		const [meeting, brokers, accounts] = await Promise.all([
			requireMeetingRecordByKey(ctx, args.meetingKey as MeetingKey),
			ctx.db.query('brokers').collect(),
			ctx.db.query('accounts').collect()
		]);
		const activities = await ctx.db
			.query('activities')
			.withIndex('by_meeting_id_stream_occurred_on_iso', (query) =>
				query.eq('meetingId', meeting.id).eq('stream', 'meeting-update')
			)
			.collect();
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const peopleById = createDashboardPersonByBrokerIdMap(brokerRecords);
		const meetingUpdateActivities = sortAccountActivitiesAscending(
			activities.map((activity) => toActivityRecord(activity))
		);
		const accountRecords = accounts.map((account) => toAccountRecord(account));

		return {
			referenceMeetingDateIso: meeting.dateIso,
			timelineItems: meetingUpdateActivities.map((activity) => toTimelineItem(activity, peopleById)),
			accounts: toSinceLastMeetingAccounts(meetingUpdateActivities, createAccountByIdMap(accountRecords)),
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
		accountKey: v.string()
	},
	returns: v.union(sinceLastMeetingDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<AccountDetailReadModel | null> => {
		const [meeting, account] = await Promise.all([
			requireMeetingRecordByKey(ctx, args.meetingKey as MeetingKey),
			findAccountDocumentByKey(ctx, args.accountKey as AccountKey)
		]);

		if (!account) {
			return null;
		}

		const meetingActivities = await ctx.db
			.query('activities')
			.withIndex('by_meeting_id_account_id_stream_occurred_on_iso', (query) =>
				query.eq('meetingId', meeting.id).eq('accountId', account._id).eq('stream', 'meeting-update')
			)
			.collect();

		if (meetingActivities.length === 0) {
			return null;
		}

		return getAccountDetailReadModel(ctx, args.accountKey as AccountKey);
	}
});
