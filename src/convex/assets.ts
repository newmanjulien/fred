import { v } from 'convex/values';
import { mutation, type QueryCtx } from './_generated/server';

export const OVERBASE_LOGO_ASSET_KEY = 'overbase-logo';
export const OVERBASE_LOGO_ALT = 'Overbase logo';

async function findAssetDocumentByKey(ctx: Pick<QueryCtx, 'db'>, key: string) {
	return ctx.db
		.query('assets')
		.withIndex('by_key', (query) => query.eq('key', key))
		.unique();
}

export async function getDashboardBranding(ctx: QueryCtx) {
	const logoAsset = await findAssetDocumentByKey(ctx, OVERBASE_LOGO_ASSET_KEY);

	if (!logoAsset) {
		throw new Error(`Missing dashboard logo asset "${OVERBASE_LOGO_ASSET_KEY}".`);
	}

	const logoUrl = await ctx.storage.getUrl(logoAsset.storageId);

	if (!logoUrl) {
		throw new Error(`Dashboard logo asset "${OVERBASE_LOGO_ASSET_KEY}" is not accessible.`);
	}

	return {
		logoUrl,
		logoAlt: logoAsset.alt
	};
}

export const upsertAsset = mutation({
	args: {
		key: v.string(),
		storageId: v.id('_storage'),
		alt: v.string()
	},
	returns: v.object({
		assetId: v.id('assets'),
		status: v.union(v.literal('created'), v.literal('updated'))
	}),
	handler: async (ctx, args) => {
		const existingAsset = await findAssetDocumentByKey(ctx, args.key);

		if (existingAsset) {
			await ctx.db.patch(existingAsset._id, {
				storageId: args.storageId,
				alt: args.alt
			});

			return {
				assetId: existingAsset._id,
				status: 'updated' as const
			};
		}

		const assetId = await ctx.db.insert('assets', {
			key: args.key,
			storageId: args.storageId,
			alt: args.alt
		});

		return {
			assetId,
			status: 'created' as const
		};
	}
});
