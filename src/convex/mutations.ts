import { action, mutation } from './_generated/server';
import { v } from 'convex/values';
import { makeFunctionReference, type FunctionReference } from 'convex/server';
import type { AccountId } from '../lib/types/ids';
import type { AccountKey } from '../lib/types/keys';
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
