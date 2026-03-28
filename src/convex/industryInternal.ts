import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { accountIndustryValidator } from './validators';
import type { AccountKey } from '../lib/types/keys';

export type UpdateAccountIndustryResult = 'updated' | 'not-found';

export const updateAccountIndustryResultValidator = v.union(
	v.literal('updated'),
	v.literal('not-found')
);

export const findAccountIdByKeyForUpdate = internalQuery({
	args: {
		accountKey: v.string()
	},
	returns: v.union(v.id('accounts'), v.null()),
	handler: async (ctx, args) => {
		const account = await ctx.db
			.query('accounts')
			.withIndex('by_key', (query) => query.eq('key', args.accountKey as AccountKey))
			.unique();

		return account?._id ?? null;
	}
});

export const updateAccountIndustryByCanonicalId = internalMutation({
	args: {
		accountId: v.id('accounts'),
		industry: accountIndustryValidator
	},
	returns: updateAccountIndustryResultValidator,
	handler: async (ctx, args) => {
		const account = await ctx.db.get(args.accountId);

		if (!account) {
			return 'not-found';
		}

		await ctx.db.patch(args.accountId, {
			industry: args.industry
		});

		return 'updated';
	}
});
