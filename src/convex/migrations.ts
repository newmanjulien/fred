import { action, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { makeFunctionReference, type FunctionReference } from 'convex/server';
import { flattenLegacyOrgChartRoot, hasLegacyOrgChartRoot } from './orgChartMigration';
import { recomputeAccountSummary } from './accountActivityGateway';

type LegacyOrgChartStatus = {
	accountsWithLegacyOrgChartRoot: number;
	accountsWithFlatOrgChartNodes: number;
	insightsWithLegacyOrgChartRoot: number;
	insightsWithFlatOrgChartNodes: number;
};

type LegacyOrgChartMigrationResult = LegacyOrgChartStatus & {
	migratedAccounts: number;
	migratedInsights: number;
	dryRun: boolean;
};

type RebuildAccountSummariesResult = {
	processedAccounts: number;
	createdSummaries: number;
	updatedSummaries: number;
	deletedOrphanSummaries: number;
	dryRun: boolean;
};

const legacyOrgChartStatusValidator = v.object({
	accountsWithLegacyOrgChartRoot: v.number(),
	accountsWithFlatOrgChartNodes: v.number(),
	insightsWithLegacyOrgChartRoot: v.number(),
	insightsWithFlatOrgChartNodes: v.number()
});

const legacyOrgChartMigrationResultValidator = v.object({
	accountsWithLegacyOrgChartRoot: v.number(),
	accountsWithFlatOrgChartNodes: v.number(),
	insightsWithLegacyOrgChartRoot: v.number(),
	insightsWithFlatOrgChartNodes: v.number(),
	migratedAccounts: v.number(),
	migratedInsights: v.number(),
	dryRun: v.boolean()
});

const rebuildAccountSummariesResultValidator = v.object({
	processedAccounts: v.number(),
	createdSummaries: v.number(),
	updatedSummaries: v.number(),
	deletedOrphanSummaries: v.number(),
	dryRun: v.boolean()
});

const migrateLegacyOrgChartsInPlaceReference = makeFunctionReference<
	'mutation',
	{ dryRun: boolean },
	LegacyOrgChartMigrationResult
>('migrations:migrateLegacyOrgChartsInPlace') as unknown as FunctionReference<
	'mutation',
	'public',
	{ dryRun: boolean },
	LegacyOrgChartMigrationResult
>;

const rebuildAccountSummariesInPlaceReference = makeFunctionReference<
	'mutation',
	{ dryRun: boolean },
	RebuildAccountSummariesResult
>('migrations:rebuildAccountSummariesInPlace') as unknown as FunctionReference<
	'mutation',
	'public',
	{ dryRun: boolean },
	RebuildAccountSummariesResult
>;

function hasFlatOrgChartNodes(
	value: unknown
): value is {
	orgChartNodes: unknown[];
} {
	return (
		Boolean(value) &&
		typeof value === 'object' &&
		Array.isArray((value as Record<string, unknown>).orgChartNodes)
	);
}

function toLegacyOrgChartStatus(params: {
	accounts: unknown[];
	insights: unknown[];
}): LegacyOrgChartStatus {
	const accountsWithLegacyOrgChartRoot = params.accounts.filter((account) =>
		hasLegacyOrgChartRoot((account as { context?: unknown }).context)
	).length;
	const accountsWithFlatOrgChartNodes = params.accounts.filter((account) =>
		hasFlatOrgChartNodes((account as { context?: unknown }).context)
	).length;
	const insightsWithLegacyOrgChartRoot = params.insights.filter((insight) =>
		hasLegacyOrgChartRoot(insight)
	).length;
	const insightsWithFlatOrgChartNodes = params.insights.filter((insight) =>
		hasFlatOrgChartNodes(insight)
	).length;

	return {
		accountsWithLegacyOrgChartRoot,
		accountsWithFlatOrgChartNodes,
		insightsWithLegacyOrgChartRoot,
		insightsWithFlatOrgChartNodes
	};
}

export const reportLegacyOrgCharts = query({
	args: {},
	returns: legacyOrgChartStatusValidator,
	handler: async (ctx): Promise<LegacyOrgChartStatus> => {
		const [accounts, insights] = await Promise.all([
			ctx.db.query('accounts').collect(),
			ctx.db.query('insights').collect()
		]);

		return toLegacyOrgChartStatus({ accounts, insights });
	}
});

export const migrateLegacyOrgCharts = action({
	args: {
		dryRun: v.optional(v.boolean())
	},
	returns: legacyOrgChartMigrationResultValidator,
	handler: async (ctx, args): Promise<LegacyOrgChartMigrationResult> => {
		return ctx.runMutation(migrateLegacyOrgChartsInPlaceReference, {
			dryRun: args.dryRun ?? false
		});
	}
});

export const migrateLegacyOrgChartsInPlace = mutation({
	args: {
		dryRun: v.boolean()
	},
	returns: legacyOrgChartMigrationResultValidator,
	handler: async (ctx, args): Promise<LegacyOrgChartMigrationResult> => {
		const [accounts, insights] = await Promise.all([
			ctx.db.query('accounts').collect(),
			ctx.db.query('insights').collect()
		]);
		const status = toLegacyOrgChartStatus({ accounts, insights });
		let migratedAccounts = 0;
		let migratedInsights = 0;

		for (const account of accounts) {
			const accountContext = (account as { context?: unknown }).context;

			if (!hasLegacyOrgChartRoot(accountContext)) {
				continue;
			}

			migratedAccounts += 1;

			if (args.dryRun) {
				continue;
			}

			const { _id, _creationTime, ...rest } = account;
			void _creationTime;
			const rawAccountContext = accountContext as {
				summary: string;
				claimedAtIso: string;
				helpfulContacts?: {
					id: string;
					name: string;
					title: string;
					company: string;
					linkedInUrl: string;
				}[];
				orgChartRoot: unknown;
			};

			await ctx.db.replace(_id, {
				...rest,
				context: {
					summary: rawAccountContext.summary,
					claimedAtIso: rawAccountContext.claimedAtIso,
					...(rawAccountContext.helpfulContacts
						? { helpfulContacts: rawAccountContext.helpfulContacts }
						: {}),
					orgChartNodes: flattenLegacyOrgChartRoot(
						rawAccountContext.orgChartRoot,
						`accounts["${account._id}"].context.orgChartRoot`
					)
				}
			});
		}

		for (const insight of insights) {
			if (!hasLegacyOrgChartRoot(insight)) {
				continue;
			}

			migratedInsights += 1;

			if (args.dryRun) {
				continue;
			}

			const rawInsight = insight as typeof insight & { orgChartRoot: unknown };
			const { _id, _creationTime, orgChartRoot, ...restInsight } = rawInsight;
			void _creationTime;

			await ctx.db.replace(_id, {
				...restInsight,
				orgChartNodes: flattenLegacyOrgChartRoot(
					orgChartRoot,
					`insights["${insight._id}"].orgChartRoot`
				)
			});
		}

		return {
			...status,
			migratedAccounts,
			migratedInsights,
			dryRun: args.dryRun
		};
	}
});

export const rebuildAccountSummaries = action({
	args: {
		dryRun: v.optional(v.boolean())
	},
	returns: rebuildAccountSummariesResultValidator,
	handler: async (ctx, args): Promise<RebuildAccountSummariesResult> => {
		return ctx.runMutation(rebuildAccountSummariesInPlaceReference, {
			dryRun: args.dryRun ?? false
		});
	}
});

export const rebuildAccountSummariesInPlace = mutation({
	args: {
		dryRun: v.boolean()
	},
	returns: rebuildAccountSummariesResultValidator,
	handler: async (ctx, args): Promise<RebuildAccountSummariesResult> => {
		const [accounts, summaries] = await Promise.all([
			ctx.db.query('accounts').collect(),
			ctx.db.query('accountSummaries').collect()
		]);
		const accountIds = new Set(accounts.map((account) => account._id));
		let createdSummaries = 0;
		let updatedSummaries = 0;
		let deletedOrphanSummaries = 0;

		for (const summary of summaries) {
			if (accountIds.has(summary.accountId)) {
				continue;
			}

			deletedOrphanSummaries += 1;

			if (!args.dryRun) {
				await ctx.db.delete(summary._id);
			}
		}

		for (const account of accounts) {
			const existingSummary = summaries.find((summary) => summary.accountId === account._id);

			if (existingSummary) {
				updatedSummaries += 1;
			} else {
				createdSummaries += 1;
			}

			if (!args.dryRun) {
				await recomputeAccountSummary(ctx, account._id);
			}
		}

		return {
			processedAccounts: accounts.length,
			createdSummaries,
			updatedSummaries,
			deletedOrphanSummaries,
			dryRun: args.dryRun
		};
	}
});
