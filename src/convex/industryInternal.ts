import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { dealIndustryValidator } from './validators';
import type { DealKey } from '../lib/types/keys';

export type UpdateDealIndustryResult = 'updated' | 'not-found';

export const updateDealIndustryResultValidator = v.union(
	v.literal('updated'),
	v.literal('not-found')
);

export const findDealIdByKeyForUpdate = internalQuery({
	args: {
		dealKey: v.string()
	},
	returns: v.union(v.id('deals'), v.null()),
	handler: async (ctx, args) => {
		const deal = await ctx.db
			.query('deals')
			.withIndex('by_key', (query) => query.eq('key', args.dealKey as DealKey))
			.unique();

		return deal?._id ?? null;
	}
});

export const updateDealIndustryByCanonicalId = internalMutation({
	args: {
		dealId: v.id('deals'),
		industry: dealIndustryValidator
	},
	returns: updateDealIndustryResultValidator,
	handler: async (ctx, args) => {
		const deal = await ctx.db.get(args.dealId);

		if (!deal) {
			return 'not-found';
		}

		await ctx.db.patch(args.dealId, {
			industry: args.industry
		});

		return 'updated';
	}
});
