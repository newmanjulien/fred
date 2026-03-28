import { action, mutation } from './_generated/server';
import { v } from 'convex/values';
import { makeFunctionReference, type FunctionReference } from 'convex/server';
import type { DealId } from '../lib/types/ids';
import type { DealKey } from '../lib/types/keys';
import type { DealIndustry } from '../lib/types/vocab';
import { dealIndustryValidator } from './validators';
import {
	type UpdateDealIndustryResult,
	updateDealIndustryResultValidator
} from './industryInternal';

const brokerAvatarUpdateValidator = v.object({
	name: v.string(),
	avatar: v.id('_storage')
});

const findDealIdByKeyForUpdateReference = makeFunctionReference<
	'query',
	{ dealKey: string },
	DealId | null
>('industryInternal:findDealIdByKeyForUpdate') as unknown as FunctionReference<
	'query',
	'internal',
	{ dealKey: string },
	DealId | null
>;

const updateDealIndustryByCanonicalIdReference = makeFunctionReference<
	'mutation',
	{ dealId: DealId; industry: DealIndustry },
	UpdateDealIndustryResult
>('industryInternal:updateDealIndustryByCanonicalId') as unknown as FunctionReference<
	'mutation',
	'internal',
	{ dealId: DealId; industry: DealIndustry },
	UpdateDealIndustryResult
>;

export const updateDealIndustry = action({
	args: {
		dealKey: v.string(),
		industry: dealIndustryValidator
	},
	returns: updateDealIndustryResultValidator,
	handler: async (
		ctx,
		args: { dealKey: DealKey; industry: DealIndustry }
	): Promise<UpdateDealIndustryResult> => {
		const normalizedDealId: DealId | null = await ctx.runQuery(findDealIdByKeyForUpdateReference, {
			dealKey: args.dealKey
		});

		if (!normalizedDealId) {
			return 'not-found';
		}

		return ctx.runMutation(updateDealIndustryByCanonicalIdReference, {
			dealId: normalizedDealId,
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
