import { action, mutation } from './_generated/server';
import { v } from 'convex/values';
import { makeFunctionReference, type FunctionReference } from 'convex/server';
import type { AccountId, BrokerId } from '../lib/types/ids';
import type { AccountKey, BrokerKey } from '../lib/types/keys';
import type { AccountIndustry } from '../lib/types/vocab';
import { accountIndustryValidator } from './validators';
import {
	type UpdateAccountIndustryResult,
	updateAccountIndustryResultValidator
} from './industryInternal';

const brokerAvatarUpdateValidator = v.object({
	name: v.string(),
	avatar: v.id('_storage')
});

const findAccountIdByKeyForUpdateReference = makeFunctionReference<
	'query',
	{ accountKey: string },
	AccountId | null
>('industryInternal:findAccountIdByKeyForUpdate') as unknown as FunctionReference<
	'query',
	'internal',
	{ accountKey: string },
	AccountId | null
>;

const updateAccountIndustryByCanonicalIdReference = makeFunctionReference<
	'mutation',
	{ accountId: AccountId; industry: AccountIndustry },
	UpdateAccountIndustryResult
>('industryInternal:updateAccountIndustryByCanonicalId') as unknown as FunctionReference<
	'mutation',
	'internal',
	{ accountId: AccountId; industry: AccountIndustry },
	UpdateAccountIndustryResult
>;

const resolveAskForUpdateTargetsReference = makeFunctionReference<
	'query',
	{ accountKeys: string[]; actorBrokerKey: string },
	{
		accountIds: AccountId[];
		actorBrokerId: BrokerId | null;
	}
>('askForUpdateInternal:resolveAskForUpdateTargets') as unknown as FunctionReference<
	'query',
	'internal',
	{ accountKeys: AccountKey[]; actorBrokerKey: BrokerKey },
	{
		accountIds: AccountId[];
		actorBrokerId: BrokerId | null;
	}
>;

const createAskForUpdateActivitiesReference = makeFunctionReference<
	'mutation',
	{
		accountIds: AccountId[];
		actorBrokerId: BrokerId;
		occurredAtIso: string;
	},
	{ createdCount: number }
>('askForUpdateInternal:createAskForUpdateActivities') as unknown as FunctionReference<
	'mutation',
	'internal',
	{
		accountIds: AccountId[];
		actorBrokerId: BrokerId;
		occurredAtIso: string;
	},
	{ createdCount: number }
>;

export const updateAccountIndustry = action({
	args: {
		accountKey: v.string(),
		industry: accountIndustryValidator
	},
	returns: updateAccountIndustryResultValidator,
	handler: async (
		ctx,
		args: { accountKey: AccountKey; industry: AccountIndustry }
	): Promise<UpdateAccountIndustryResult> => {
		const normalizedAccountId: AccountId | null = await ctx.runQuery(findAccountIdByKeyForUpdateReference, {
			accountKey: args.accountKey
		});

		if (!normalizedAccountId) {
			return 'not-found';
		}

		return ctx.runMutation(updateAccountIndustryByCanonicalIdReference, {
			accountId: normalizedAccountId,
			industry: args.industry
		});
	}
});

export const askForAccountUpdate = action({
	args: {
		accountKeys: v.array(v.string()),
		actorBrokerKey: v.string()
	},
	returns: v.object({
		createdCount: v.number()
	}),
	handler: async (ctx, args) => {
		const targets = await ctx.runQuery(resolveAskForUpdateTargetsReference, {
			accountKeys: args.accountKeys as AccountKey[],
			actorBrokerKey: args.actorBrokerKey as BrokerKey
		});

		if (!targets.actorBrokerId) {
			throw new Error(`Unknown broker "${args.actorBrokerKey}".`);
		}

		if (targets.accountIds.length === 0) {
			return { createdCount: 0 };
		}

		const occurredAtIso = new Date().toISOString();

		return ctx.runMutation(createAskForUpdateActivitiesReference, {
			accountIds: targets.accountIds,
			actorBrokerId: targets.actorBrokerId,
			occurredAtIso
		});
	}
});

export const setBrokerAvatarStorageIds = mutation({
	args: {
		updates: v.array(brokerAvatarUpdateValidator)
	},
	returns: v.object({
		updatedCount: v.number()
	}),
	handler: async (ctx, args) => {
		const brokers = await ctx.db.query('brokers').collect();
		let updatedCount = 0;

		for (const update of args.updates) {
			const broker = brokers.find((candidate) => candidate.name === update.name);

			if (!broker) {
				throw new Error(`Unknown broker "${update.name}".`);
			}

			await ctx.db.patch(broker._id, {
				avatar: update.avatar
			});
			updatedCount += 1;
		}

		return { updatedCount };
	}
});
