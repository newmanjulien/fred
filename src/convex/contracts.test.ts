import { convexTest } from 'convex-test';
import { makeFunctionReference, type FunctionReference } from 'convex/server';
import { describe, expect, it } from 'vitest';
import type { OrgChartNodeRecord as InternalOrgChartNodeRecord } from '../lib/domain/org-chart';
import type { BrokerKey, AccountKey, InsightKey, MeetingKey } from '../lib/types/keys';
import { api } from './_generated/api';
import { flattenLegacyOrgChartRoot } from './orgChartMigration';
import schema from './schema';
import { convexTestModules } from './test.setup';

const reportLegacyOrgChartsReference = makeFunctionReference<'query', {}, unknown>(
	'migrations:reportLegacyOrgCharts'
) as unknown as FunctionReference<'query', 'public', {}, unknown>;

const migrateLegacyOrgChartsReference = makeFunctionReference<
	'action',
	{ dryRun?: boolean },
	unknown
>('migrations:migrateLegacyOrgCharts') as unknown as FunctionReference<
	'action',
	'public',
	{ dryRun?: boolean },
	unknown
>;

function createConvex() {
	return convexTest(schema, convexTestModules);
}

function toExpectedDashboardOrgChartNodes(
	nodes: readonly InternalOrgChartNodeRecord[],
	params: {
		ownerBrokerId: string;
		ownerBrokerKey: string;
		collaboratorBrokerKey: string;
	}
) {
	return nodes.map((node) => ({
		id: node.id,
		name: node.name,
		role: node.role,
		parentId: node.parentId,
		lastContactedByBrokerKey:
			node.lastContactedByBrokerId === params.ownerBrokerId
				? params.ownerBrokerKey
				: params.collaboratorBrokerKey,
		lastContactedOnIso: node.lastContactedOnIso
	}));
}

async function seedDashboardRecords(t: ReturnType<typeof createConvex>) {
	return t.run(async (ctx) => {
		const ownerBrokerKey = 'julien' as BrokerKey;
		const collaboratorBrokerKey = 'mina' as BrokerKey;
		const accountKey = 'acme-expansion' as AccountKey;
		const insightKey = 'expand-adjacent-services' as InsightKey;
		const march20MeetingKey = '2026-03-20' as MeetingKey;
		const march27MeetingKey = '2026-03-27' as MeetingKey;

		const ownerBrokerId = await ctx.db.insert('brokers', {
			key: ownerBrokerKey,
			name: 'Julien Newman',
			avatar: '/avatars/julien.png'
		});
		const collaboratorBrokerId = await ctx.db.insert('brokers', {
			key: collaboratorBrokerKey,
			name: 'Mina Chen',
			avatar: '/avatars/mina.png'
		});

		const march20MeetingId = await ctx.db.insert('meetings', {
			key: march20MeetingKey,
			dateIso: '2026-03-20'
		});
		const march27MeetingId = await ctx.db.insert('meetings', {
			key: march27MeetingKey,
			dateIso: '2026-03-27'
		});

		const accountOrgChartNodes: InternalOrgChartNodeRecord[] = [
			{
				id: 'root',
				name: 'Alex Morgan',
				role: 'CFO',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-21'
			},
			{
				id: 'vp-finance',
				parentId: 'root',
				name: 'Taylor Smith',
				role: 'VP Finance',
				lastContactedByBrokerId: collaboratorBrokerId,
				lastContactedOnIso: '2026-03-22'
			},
			{
				id: 'controller',
				parentId: 'vp-finance',
				name: 'Jordan Lee',
				role: 'Controller',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-23'
			},
			{
				id: 'cio',
				parentId: 'root',
				name: 'Morgan Ellis',
				role: 'CIO',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-24'
			}
		];
		const insightOrgChartNodes: InternalOrgChartNodeRecord[] = [
			{
				id: 'root',
				name: 'Alex Morgan',
				role: 'CFO',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-21'
			},
			{
				id: 'security',
				parentId: 'root',
				name: 'Sam Rivera',
				role: 'Head of Security',
				lastContactedByBrokerId: collaboratorBrokerId,
				lastContactedOnIso: '2026-03-22'
			},
			{
				id: 'procurement',
				parentId: 'root',
				name: 'Parker Lee',
				role: 'Procurement Lead',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-23'
			}
		];

		const accountId = await ctx.db.insert('accounts', {
			key: accountKey,
			accountNumber: 42,
			industry: 'Hospitality',
			accountName: 'Acme Expansion',
			isRenewal: false,
			isReservedInEpic: false,
			probability: 70,
			stage: 'Discovery',
			isLikelyOutOfDate: false,
			activityLevel: 'high',
			lastActivityAtIso: '2026-03-24T10:00:00Z',
			ownerBrokerId,
			collaboratorBrokerIds: [collaboratorBrokerId],
			context: {
				summary: 'Needs support on procurement timing.',
				claimedAtIso: '2026-03-10T09:00:00Z',
				orgChartNodes: accountOrgChartNodes,
				helpfulContacts: [
					{
						id: 'contact-1',
						name: 'Taylor Smith',
						title: 'VP Finance',
						company: 'Acme Foods',
						linkedInUrl: 'https://linkedin.com/in/taylor-smith'
					}
				]
			},
			dashboardFlags: {
				needsSupport: true,
				duplicatedWork: false
			}
		});

		await ctx.db.insert('news', {
			accountId,
			title: 'Acme opens a new distribution hub',
			source: 'news',
			publishedOnIso: '2026-03-25',
			url: 'https://news.example.com/articles/acme-distribution-hub'
		});
		await ctx.db.insert('news', {
			accountId,
			title: 'Older weekly note',
			source: 'linkedin',
			publishedOnIso: '2026-03-12',
			url: 'https://www.linkedin.com/posts/acme-weekly-note'
		});

		await ctx.db.insert('activities', {
			accountId,
			stream: 'account-detail',
			occurredOnIso: '2026-03-24',
			body: 'Discussed procurement blockers.',
			marker: { kind: 'dot' },
			title: 'Weekly follow-up'
		});
		await ctx.db.insert('activities', {
			accountId,
			meetingId: march27MeetingId,
			stream: 'meeting-update',
			occurredOnIso: '2026-03-18',
			body: 'This belongs to a different meeting.',
			marker: { kind: 'dot' },
			title: 'Old update'
		});
		await ctx.db.insert('activities', {
			accountId,
			meetingId: march20MeetingId,
			stream: 'meeting-update',
			occurredOnIso: '2026-03-22',
			body: 'This should appear in since-last-meeting.',
			marker: { kind: 'dot' },
			title: 'Fresh update'
		});

		const insightId = await ctx.db.insert('insights', {
			key: insightKey,
			accountId,
			meetingId: march20MeetingId,
			kind: 'opportunity',
			title: 'Expand into adjacent services',
			ownerBrokerId,
			collaboratorBrokerIds: [collaboratorBrokerId],
			timeline: [
				{
					id: 'timeline-1',
					accountId,
					stream: 'account-detail',
					occurredOnIso: '2026-03-23',
					body: 'Customer is receptive to a broader package.',
					marker: { kind: 'dot' },
					title: 'Procurement note'
				}
			],
			orgChartNodes: insightOrgChartNodes
		});

		return {
			ownerBrokerId,
			ownerBrokerKey,
			collaboratorBrokerId,
			collaboratorBrokerKey,
			accountId,
			accountKey,
			insightId,
			insightKey,
			march20MeetingId,
			march20MeetingKey,
			accountOrgChartNodes,
			insightOrgChartNodes
		};
	});
}

function getIndustryRow(result: {
	rightRail: {
		sections: {
			kind: 'rows' | 'helpful-contacts';
			rows?: {
				kind: string;
				accountKey?: string;
			}[];
		}[];
	};
}) {
	for (const section of result.rightRail.sections) {
		if (section.kind !== 'rows') {
			continue;
		}

		for (const row of section.rows ?? []) {
			if (row.kind === 'industry') {
				return row;
			}
		}
	}

	return null;
}

describe('Convex feature contracts', () => {
	it('serves the core dashboard read models without leaking UI shell contracts', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const myAccountsList = await t.query(api.myAccounts.getMyAccountsList, {
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});
		const myAccountsDetail = await t.query(api.myAccounts.getMyAccountsDetail, {
			accountKey: seed.accountKey,
			brokerKey: seed.collaboratorBrokerKey
		});
		const newBusinessList = await t.query(api.newBusiness.getNewBusinessList, {
			view: 'accounts'
		});
		const newBusinessDetail = await t.query(api.newBusiness.getNewBusinessDetail, {
			accountKey: seed.accountKey
		});
		const renewalsList = await t.query(api.renewals.getRenewalsList, {
			view: 'accounts'
		});
		const renewalsLikelyOutOfDateList = await t.query(api.renewals.getRenewalsList, {
			view: 'likely-out-of-date'
		});
		const sinceLastMeeting = await t.query(api.sinceLastMeeting.getSinceLastMeeting, {
			meetingKey: seed.march20MeetingKey
		});
		const sinceLastMeetingDetail = await t.query(api.sinceLastMeeting.getSinceLastMeetingDetail, {
			meetingKey: seed.march20MeetingKey,
			accountKey: seed.accountKey
		});
		const opportunitiesList = await t.query(api.opportunities.getOpportunitiesList, {
			meetingKey: seed.march20MeetingKey
		});
		const opportunityDetail = await t.query(api.opportunities.getOpportunityDetail, {
			insightKey: seed.insightKey,
			meetingKey: seed.march20MeetingKey
		});

		expect(myAccountsList).not.toHaveProperty('header');
		expect(myAccountsList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.accountKey,
					detail: {
						accountKey: seed.accountKey,
						defaultTab: 'news'
					}
				})
			])
		);
		expect(myAccountsDetail?.title).toBe('Acme Expansion');
		expect(getIndustryRow(myAccountsDetail!)).toMatchObject({ accountKey: seed.accountKey });

		expect(newBusinessList).not.toHaveProperty('header');
		expect(newBusinessList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.accountKey,
					hasDetail: true
				})
			])
		);
		expect(newBusinessDetail?.title).toBe('Acme Expansion');
		expect(newBusinessDetail?.orgChartNodes).toEqual(
			toExpectedDashboardOrgChartNodes(seed.accountOrgChartNodes, seed)
		);

		expect(renewalsList).not.toHaveProperty('header');
		expect(renewalsList.rows).toEqual([]);
		expect(renewalsLikelyOutOfDateList.rows).toEqual([]);

		expect(sinceLastMeeting.accounts).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.accountKey,
					hasDetail: true
				})
			])
		);
		expect(sinceLastMeetingDetail?.title).toBe('Acme Expansion');
		expect(sinceLastMeetingDetail?.orgChartNodes).toEqual(
			toExpectedDashboardOrgChartNodes(seed.accountOrgChartNodes, seed)
		);

		expect(opportunitiesList.opportunityTiles).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.insightKey
				})
			])
		);
		expect(opportunitiesList.opportunityTiles[0]).not.toHaveProperty('detail');
		expect(opportunityDetail?.title).toBe('Expand into adjacent services');
		expect(opportunityDetail?.orgChartNodes).toEqual(
			toExpectedDashboardOrgChartNodes(seed.insightOrgChartNodes, seed)
		);
	});

	it('returns null for invalid detail route keys', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		await expect(
			t.query(api.myAccounts.getMyAccountsDetail, {
				accountKey: 'not-a-account-key',
				brokerKey: seed.collaboratorBrokerKey
			})
		).resolves.toBeNull();
		await expect(
			t.query(api.newBusiness.getNewBusinessDetail, {
				accountKey: 'bad-account-key'
			})
		).resolves.toBeNull();
		await expect(
			t.query(api.renewals.getRenewalsDetail, {
				accountKey: 'bad-account-key'
			})
		).resolves.toBeNull();
		await expect(
			t.query(api.sinceLastMeeting.getSinceLastMeetingDetail, {
				meetingKey: seed.march20MeetingKey,
				accountKey: 'bad-account-key'
			})
		).resolves.toBeNull();
		await expect(
			t.query(api.opportunities.getOpportunityDetail, {
				insightKey: 'bad-insight-key',
				meetingKey: seed.march20MeetingKey
			})
		).resolves.toBeNull();
	});

	it('routes renewal accounts to renewals and excludes them from new business', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);
		const renewalAccountKey = 'acme-renewal' as AccountKey;

		await t.run(async (ctx) => {
			await ctx.db.insert('accounts', {
				key: renewalAccountKey,
				accountNumber: 314,
				industry: 'Hospitality',
				accountName: 'Acme Renewal',
				isRenewal: true,
				isReservedInEpic: false,
				probability: 85,
				stage: 'Proposal',
				isLikelyOutOfDate: true,
				activityLevel: 'medium',
				lastActivityAtIso: '2026-03-26T10:00:00Z',
				ownerBrokerId: seed.ownerBrokerId,
				collaboratorBrokerIds: [seed.collaboratorBrokerId],
				context: {
					summary: 'Renewal tracking started before pricing is finalized.',
					claimedAtIso: '2026-03-11T09:00:00Z',
					orgChartNodes: seed.accountOrgChartNodes
				},
				dashboardFlags: {
					needsSupport: false,
					duplicatedWork: false
				}
			});
		});

		const newBusinessList = await t.query(api.newBusiness.getNewBusinessList, {
			view: 'accounts'
		});
		const renewalsList = await t.query(api.renewals.getRenewalsList, {
			view: 'accounts'
		});
		const renewalsLikelyOutOfDateList = await t.query(api.renewals.getRenewalsList, {
			view: 'likely-out-of-date'
		});
		const renewalsDetail = await t.query(api.renewals.getRenewalsDetail, {
			accountKey: renewalAccountKey
		});

		expect(newBusinessList.rows).not.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: renewalAccountKey
				})
			])
		);
		expect(renewalsList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: renewalAccountKey,
					hasDetail: true
				})
			])
		);
		expect(renewalsLikelyOutOfDateList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: renewalAccountKey,
					hasDetail: true
				})
			])
		);
		expect(renewalsDetail?.title).toBe('Acme Renewal');
	});

	it('reports zero legacy org charts once data is stored in the flat shape', async () => {
		const t = createConvex();
		await seedDashboardRecords(t);

		await expect(t.query(reportLegacyOrgChartsReference, {})).resolves.toEqual({
			accountsWithLegacyOrgChartRoot: 0,
			accountsWithFlatOrgChartNodes: 1,
			insightsWithLegacyOrgChartRoot: 0,
			insightsWithFlatOrgChartNodes: 1
		});
		await expect(t.action(migrateLegacyOrgChartsReference, { dryRun: true })).resolves.toEqual({
			accountsWithLegacyOrgChartRoot: 0,
			accountsWithFlatOrgChartNodes: 1,
			insightsWithLegacyOrgChartRoot: 0,
			insightsWithFlatOrgChartNodes: 1,
			migratedAccounts: 0,
			migratedInsights: 0,
			dryRun: true
		});
	});

	it('flattens legacy nested org charts with a dedicated migration helper', () => {
		expect(
			flattenLegacyOrgChartRoot({
				id: 'legacy-root',
				name: 'Alex Morgan',
				role: 'CFO',
				lastContactedByBrokerId: 'broker-1',
				lastContactedOnIso: '2026-03-21',
				directReports: [
					{
						id: 'legacy-child',
						name: 'Taylor Smith',
						role: 'VP Finance',
						lastContactedByBrokerId: 'broker-2',
						lastContactedOnIso: '2026-03-22'
					}
				]
			})
		).toEqual([
			{
				id: 'legacy-root',
				name: 'Alex Morgan',
				role: 'CFO',
				parentId: undefined,
				lastContactedByBrokerId: 'broker-1',
				lastContactedOnIso: '2026-03-21'
			},
			{
				id: 'legacy-child',
				parentId: 'legacy-root',
				name: 'Taylor Smith',
				role: 'VP Finance',
				lastContactedByBrokerId: 'broker-2',
				lastContactedOnIso: '2026-03-22'
			}
		]);
	});

	it('rejects malformed stored meeting dates at the read boundary', async () => {
		const t = createConvex();

		await t.run(async (ctx) => {
			await ctx.db.insert('meetings', {
				key: 'bad-meeting-date',
				dateIso: '2026-3-20'
			});
		});

		await expect(t.query(api.shell.getDashboardShell)).rejects.toThrow(
			'Invalid ISO date at "meetings'
		);
	});

	it('scopes since-last-meeting activity and my-accounts news to the selected reference period', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const sinceLastMeeting = await t.query(api.sinceLastMeeting.getSinceLastMeeting, {
			meetingKey: seed.march20MeetingKey
		});
		const myAccountsList = await t.query(api.myAccounts.getMyAccountsList, {
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});

		expect(sinceLastMeeting.referenceMeetingDateIso).toBe('2026-03-20');
		expect(sinceLastMeeting.timelineItems).toHaveLength(1);
		expect(sinceLastMeeting.timelineItems[0]).toMatchObject({
			kind: 'headline',
			title: 'Fresh update'
		});
		expect(sinceLastMeeting.accounts).toEqual([
			expect.objectContaining({
				key: seed.accountKey
			})
		]);

		expect(myAccountsList.newsItems).toEqual([
			expect.objectContaining({
				title: 'Acme opens a new distribution hub',
				dateIso: '2026-03-25',
				url: 'https://news.example.com/articles/acme-distribution-hub'
			})
		]);
	});

	it('updates industry through the canonical account key contract', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		await expect(
			t.action(api.mutations.updateAccountIndustry, {
				accountKey: seed.accountKey,
				industry: 'Food & beverage'
			})
		).resolves.toBe('updated');
		await expect(
			t.action(api.mutations.updateAccountIndustry, {
				accountKey: 'not-a-account-key' as AccountKey,
				industry: 'Food & beverage'
			})
		).resolves.toBe('not-found');

		const updatedAccount = await t.run(async (ctx) => ctx.db.get(seed.accountId));
		expect(updatedAccount?.industry).toBe('Food & beverage');
	});
});
