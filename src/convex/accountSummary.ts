import { v } from 'convex/values';
import type { AccountId, ActivityId } from '../lib/types/ids';
import type { IsoDateTime } from '../lib/types/dates';

export const lastAccountDetailActivityValidator = v.union(
	v.object({
		kind: v.literal('none')
	}),
	v.object({
		kind: v.literal('activity'),
		occurredAtIso: v.string()
	}),
	v.object({
		kind: v.literal('waiting-for-update'),
		occurredAtIso: v.string()
	})
);

export const accountSummaryDocumentValidator = v.object({
	accountId: v.id('accounts'),
	lastAccountDetailActivity: lastAccountDetailActivityValidator,
	canRequestBrokerUpdate: v.boolean(),
	lastAccountDetailActivityId: v.optional(v.id('activities'))
});

export type LastAccountDetailActivity =
	| {
			kind: 'none';
	  }
	| {
			kind: 'activity';
			occurredAtIso: IsoDateTime;
	  }
	| {
			kind: 'waiting-for-update';
			occurredAtIso: IsoDateTime;
	  };

export type AccountSummaryRecordData = {
	id: string;
	accountId: AccountId;
	lastAccountDetailActivity: LastAccountDetailActivity;
	canRequestBrokerUpdate: boolean;
	lastAccountDetailActivityId?: ActivityId;
};

export function createEmptyLastAccountDetailActivity(): LastAccountDetailActivity {
	return {
		kind: 'none'
	};
}

export function createActivityLastAccountDetailActivity(occurredAtIso: string): LastAccountDetailActivity {
	return {
		kind: 'activity',
		occurredAtIso: occurredAtIso as IsoDateTime
	};
}

export function createWaitingForUpdateLastAccountDetailActivity(
	occurredAtIso: string
): LastAccountDetailActivity {
	return {
		kind: 'waiting-for-update',
		occurredAtIso: occurredAtIso as IsoDateTime
	};
}

export function canRequestBrokerUpdate(
	lastAccountDetailActivity: LastAccountDetailActivity
): boolean {
	return lastAccountDetailActivity.kind !== 'waiting-for-update';
}
