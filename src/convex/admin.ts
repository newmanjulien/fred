import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from './_generated/server';
import type { AccountKey } from '../lib/types/keys';

type CascadeDeleteCounts = {
	activities: number;
	news: number;
	insights: number;
	accountContextOrgChartNodes: number;
	accountHelpfulContacts: number;
	insightTimelineItems: number;
	insightOrgChartNodes: number;
};

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function buildDummyNewsUrl(newsItem: Doc<'news'>) {
	const slug = slugify(newsItem.title) || `news-${newsItem._creationTime}`;

	if (newsItem.source === 'linkedin') {
		return `https://www.linkedin.com/posts/${slug}-${newsItem._id}`;
	}

	return `https://news.example.com/articles/${slug}-${newsItem._id}`;
}

function emptyCounts(): CascadeDeleteCounts {
	return {
		activities: 0,
		news: 0,
		insights: 0,
		accountContextOrgChartNodes: 0,
		accountHelpfulContacts: 0,
		insightTimelineItems: 0,
		insightOrgChartNodes: 0
	};
}

async function findAccountByKey(
	ctx: { db: DatabaseReader | DatabaseWriter },
	accountKey: AccountKey
) {
	return ctx.db
		.query('accounts')
		.withIndex('by_key', (queryBuilder) => queryBuilder.eq('key', accountKey))
		.unique();
}

async function collectCascadeTargets(
	ctx: { db: DatabaseReader | DatabaseWriter },
	accountId: Id<'accounts'>
) {
	const [activities, newsItems, insights] = await Promise.all([
		ctx.db
			.query('activities')
			.withIndex('by_account_id_stream_occurred_on_iso', (queryBuilder) =>
				queryBuilder.eq('accountId', accountId)
			)
			.collect(),
		ctx.db
			.query('news')
			.withIndex('by_account_id_published_on_iso', (queryBuilder) =>
				queryBuilder.eq('accountId', accountId)
			)
			.collect(),
		ctx.db
			.query('insights')
			.withIndex('by_account_id', (queryBuilder) => queryBuilder.eq('accountId', accountId))
			.collect()
	]);

	return { activities, newsItems, insights };
}

function countCascadeTargets(
	account: Doc<'accounts'>,
	targets: Awaited<ReturnType<typeof collectCascadeTargets>>
): CascadeDeleteCounts {
	return {
		activities: targets.activities.length,
		news: targets.newsItems.length,
		insights: targets.insights.length,
		accountContextOrgChartNodes: account.context?.orgChartNodes.length ?? 0,
		accountHelpfulContacts: account.context?.helpfulContacts?.length ?? 0,
		insightTimelineItems: targets.insights.reduce((total, insight) => total + insight.timeline.length, 0),
		insightOrgChartNodes: targets.insights.reduce(
			(total, insight) => total + insight.orgChartNodes.length,
			0
		)
	};
}

const cascadeDeleteCountsValidator = v.object({
	activities: v.number(),
	news: v.number(),
	insights: v.number(),
	accountContextOrgChartNodes: v.number(),
	accountHelpfulContacts: v.number(),
	insightTimelineItems: v.number(),
	insightOrgChartNodes: v.number()
});

export const previewAccountCascadeDelete = query({
	args: {
		accountKey: v.string()
	},
	returns: v.object({
		status: v.union(v.literal('not-found'), v.literal('found')),
		accountKey: v.string(),
		accountId: v.optional(v.id('accounts')),
		accountName: v.optional(v.string()),
		counts: cascadeDeleteCountsValidator
	}),
	handler: async (ctx, args) => {
		const account = await findAccountByKey(ctx, args.accountKey as AccountKey);

		if (!account) {
			return {
				status: 'not-found' as const,
				accountKey: args.accountKey,
				counts: emptyCounts()
			};
		}

		const targets = await collectCascadeTargets(ctx, account._id);

		return {
			status: 'found' as const,
			accountKey: args.accountKey,
			accountId: account._id,
			accountName: account.accountName,
			counts: countCascadeTargets(account, targets)
		};
	}
});

export const deleteAccountCascade = mutation({
	args: {
		accountKey: v.string()
	},
	returns: v.object({
		status: v.union(v.literal('not-found'), v.literal('deleted')),
		accountKey: v.string(),
		accountName: v.optional(v.string()),
		counts: cascadeDeleteCountsValidator
	}),
	handler: async (ctx, args) => {
		const account = await findAccountByKey(ctx, args.accountKey as AccountKey);

		if (!account) {
			return {
				status: 'not-found' as const,
				accountKey: args.accountKey,
				counts: emptyCounts()
			};
		}

		const targets = await collectCascadeTargets(ctx, account._id);
		const counts = countCascadeTargets(account, targets);

		for (const activity of targets.activities) {
			await ctx.db.delete(activity._id);
		}

		for (const newsItem of targets.newsItems) {
			await ctx.db.delete(newsItem._id);
		}

		for (const insight of targets.insights) {
			await ctx.db.delete(insight._id);
		}

		await ctx.db.delete(account._id);

		return {
			status: 'deleted' as const,
			accountKey: args.accountKey,
			accountName: account.accountName,
			counts
		};
	}
});

export const backfillNewsLinks = mutation({
	args: {},
	returns: v.object({
		updatedCount: v.number()
	}),
	handler: async (ctx) => {
		const newsItems = await ctx.db.query('news').collect();
		let updatedCount = 0;

		for (const newsItem of newsItems) {
			if (typeof newsItem.url === 'string' && newsItem.url.length > 0) {
				continue;
			}

			await ctx.db.patch(newsItem._id, {
				url: buildDummyNewsUrl(newsItem)
			});
			updatedCount += 1;
		}

		return { updatedCount };
	}
});
