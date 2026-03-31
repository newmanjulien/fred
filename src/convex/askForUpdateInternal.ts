import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const resolveAskForUpdateTargets = internalQuery({
	args: {
		accountKeys: v.array(v.string()),
		actorBrokerKey: v.string()
	},
	returns: v.object({
		accountIds: v.array(v.id('accounts')),
		actorBrokerId: v.union(v.id('brokers'), v.null())
	}),
	handler: async (ctx, args) => {
		const actorBroker = await ctx.db
			.query('brokers')
			.withIndex('by_key', (query) => query.eq('key', args.actorBrokerKey))
			.unique();

		const accountIds: Id<'accounts'>[] = [];
		const seenAccountIds = new Set<string>();

		for (const accountKey of args.accountKeys) {
			const account = await ctx.db
				.query('accounts')
				.withIndex('by_key', (query) => query.eq('key', accountKey))
				.unique();

			if (!account || seenAccountIds.has(account._id)) {
				continue;
			}

			seenAccountIds.add(account._id);
			accountIds.push(account._id);
		}

		return {
			accountIds,
			actorBrokerId: actorBroker?._id ?? null
		};
	}
});

export const createAskForUpdateActivities = internalMutation({
	args: {
		accountIds: v.array(v.id('accounts')),
		actorBrokerId: v.id('brokers'),
		occurredAtIso: v.string()
	},
	returns: v.object({
		createdCount: v.number()
	}),
	handler: async (ctx, args) => {
		for (const accountId of args.accountIds) {
			await ctx.db.insert('activities', {
				accountId,
				stream: 'account-detail',
				occurredAtIso: args.occurredAtIso,
				body: 'Sent a notification to the broker.',
				eventKind: 'ask-for-update',
				marker: {
					kind: 'broker-avatar',
					brokerId: args.actorBrokerId
				},
				actorBrokerId: args.actorBrokerId,
				action: 'asked for an update'
			});

			await ctx.db.patch(accountId, {
				lastActivityAtIso: args.occurredAtIso
			});
		}

		return {
			createdCount: args.accountIds.length
		};
	}
});
