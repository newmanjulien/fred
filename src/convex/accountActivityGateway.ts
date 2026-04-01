import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import {
	canRequestBrokerUpdate,
	createActivityLastAccountDetailActivity,
	createEmptyLastAccountDetailActivity,
	createWaitingForUpdateLastAccountDetailActivity,
	type LastAccountDetailActivity
} from './accountSummary';

type ActivityMarkerInsert =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'broker-avatar';
			brokerId: Id<'brokers'>;
	  };

export type AccountDetailActivityInsert =
	| {
			accountId: Id<'accounts'>;
			meetingId?: Id<'meetings'>;
			stream: 'account-detail';
			occurredAtIso: string;
			body: string;
			marker: ActivityMarkerInsert;
			title: string;
	  }
	| {
			accountId: Id<'accounts'>;
			meetingId?: Id<'meetings'>;
			stream: 'account-detail';
			occurredAtIso: string;
			body: string;
			marker: ActivityMarkerInsert;
			actorBrokerId: Id<'brokers'>;
			action: string;
	  }
	| {
			accountId: Id<'accounts'>;
			meetingId?: Id<'meetings'>;
			stream: 'account-detail';
			occurredAtIso: string;
			marker: {
				kind: 'broker-avatar';
				brokerId: Id<'brokers'>;
			};
			actorBrokerId: Id<'brokers'>;
			eventKind: 'ask-for-update';
			updateRequestStatus: 'waiting' | 'provided';
	  };

function toLastAccountDetailActivity(
	activity: Doc<'activities'> | null
): LastAccountDetailActivity {
	if (!activity) {
		return createEmptyLastAccountDetailActivity();
	}

	if ('eventKind' in activity && activity.eventKind === 'ask-for-update') {
		return activity.updateRequestStatus === 'waiting'
			? createWaitingForUpdateLastAccountDetailActivity(activity.occurredAtIso)
			: createActivityLastAccountDetailActivity(activity.occurredAtIso);
	}

	return createActivityLastAccountDetailActivity(activity.occurredAtIso);
}

async function findAccountSummaryByAccountId(
	ctx: Pick<QueryCtx | MutationCtx, 'db'>,
	accountId: Id<'accounts'>
) {
	return ctx.db
		.query('accountSummaries')
		.withIndex('by_account_id', (query) => query.eq('accountId', accountId))
		.unique();
}

async function findLatestAccountDetailActivity(
	ctx: Pick<QueryCtx | MutationCtx, 'db'>,
	accountId: Id<'accounts'>
) {
	return ctx.db
		.query('activities')
		.withIndex('by_account_id_stream_occurred_at_iso', (query) =>
			query.eq('accountId', accountId).eq('stream', 'account-detail')
		)
		.order('desc')
		.first();
}

export async function recomputeAccountSummary(
	ctx: MutationCtx,
	accountId: Id<'accounts'>
) {
	const [latestAccountDetailActivity, existingSummary] = await Promise.all([
		findLatestAccountDetailActivity(ctx, accountId),
		findAccountSummaryByAccountId(ctx, accountId)
	]);
	const lastAccountDetailActivity = toLastAccountDetailActivity(latestAccountDetailActivity);
	const summaryPatch = {
		accountId,
		lastAccountDetailActivity,
		canRequestBrokerUpdate: canRequestBrokerUpdate(lastAccountDetailActivity),
		lastAccountDetailActivityId: latestAccountDetailActivity?._id
	};

	if (existingSummary) {
		await ctx.db.patch(existingSummary._id, summaryPatch);
		return existingSummary._id;
	}

	return ctx.db.insert('accountSummaries', summaryPatch);
}

export async function appendAccountDetailActivity(
	ctx: MutationCtx,
	activity: AccountDetailActivityInsert
) {
	if (activity.stream !== 'account-detail') {
		throw new Error('appendAccountDetailActivity only supports the account-detail stream.');
	}

	const activityId = await ctx.db.insert('activities', activity);
	await recomputeAccountSummary(ctx, activity.accountId);
	return activityId;
}

export async function deleteAccountDetailActivity(ctx: MutationCtx, activityId: Id<'activities'>) {
	const activity = await ctx.db.get(activityId);

	if (!activity) {
		return;
	}

	const { accountId, stream } = activity;

	await ctx.db.delete(activityId);

	if (stream === 'account-detail') {
		await recomputeAccountSummary(ctx, accountId);
	}
}

export async function deleteAccountSummaryForAccount(
	ctx: MutationCtx,
	accountId: Id<'accounts'>
) {
	const existingSummary = await findAccountSummaryByAccountId(ctx, accountId);

	if (existingSummary) {
		await ctx.db.delete(existingSummary._id);
	}
}
