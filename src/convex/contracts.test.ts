import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import type { OrgChartNodeRecord as InternalOrgChartNodeRecord } from '../lib/domain/org-chart';
import type { BrokerKey, DealKey, InsightKey, MeetingKey } from '../lib/types/keys';
import { api } from './_generated/api';
import schema from './schema';
import { convexTestModules } from './test.setup';

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
		const dealKey = 'acme-expansion' as DealKey;
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

		const dealOrgChartNodes: InternalOrgChartNodeRecord[] = [
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

		const dealId = await ctx.db.insert('deals', {
			key: dealKey,
			dealNumber: 42,
			industry: 'Hospitality',
			dealName: 'Acme Expansion',
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
				orgChartNodes: dealOrgChartNodes,
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
			dealId,
			title: 'Acme opens a new distribution hub',
			source: 'news',
			publishedOnIso: '2026-03-25'
		});
		await ctx.db.insert('news', {
			dealId,
			title: 'Older weekly note',
			source: 'linkedin',
			publishedOnIso: '2026-03-12'
		});

		await ctx.db.insert('activities', {
			dealId,
			stream: 'deal-detail',
			occurredOnIso: '2026-03-24',
			body: 'Discussed procurement blockers.',
			marker: { kind: 'dot' },
			title: 'Weekly follow-up'
		});
		await ctx.db.insert('activities', {
			dealId,
			meetingId: march27MeetingId,
			stream: 'meeting-update',
			occurredOnIso: '2026-03-18',
			body: 'This belongs to a different meeting.',
			marker: { kind: 'dot' },
			title: 'Old update'
		});
		await ctx.db.insert('activities', {
			dealId,
			meetingId: march20MeetingId,
			stream: 'meeting-update',
			occurredOnIso: '2026-03-22',
			body: 'This should appear in since-last-meeting.',
			marker: { kind: 'dot' },
			title: 'Fresh update'
		});

		const insightId = await ctx.db.insert('insights', {
			key: insightKey,
			dealId,
			meetingId: march20MeetingId,
			kind: 'opportunity',
			title: 'Expand into adjacent services',
			ownerBrokerId,
			collaboratorBrokerIds: [collaboratorBrokerId],
			timeline: [
				{
					id: 'timeline-1',
					dealId,
					stream: 'deal-detail',
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
			dealId,
			dealKey,
			insightId,
			insightKey,
			march20MeetingId,
			march20MeetingKey,
			dealOrgChartNodes,
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
				dealKey?: string;
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

		const myDealsList = await t.query(api.myDeals.getMyDealsList, {
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});
		const myDealsDetail = await t.query(api.myDeals.getMyDealsDetail, {
			dealKey: seed.dealKey,
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});
		const newBusinessList = await t.query(api.newBusiness.getNewBusinessList, {
			view: 'deals'
		});
		const newBusinessDetail = await t.query(api.newBusiness.getNewBusinessDetail, {
			dealKey: seed.dealKey
		});
		const sinceLastMeeting = await t.query(api.sinceLastMeeting.getSinceLastMeeting, {
			meetingKey: seed.march20MeetingKey
		});
		const sinceLastMeetingDetail = await t.query(api.sinceLastMeeting.getSinceLastMeetingDetail, {
			meetingKey: seed.march20MeetingKey,
			dealKey: seed.dealKey
		});
		const opportunitiesList = await t.query(api.opportunities.getOpportunitiesList, {
			meetingKey: seed.march20MeetingKey
		});
		const opportunityDetail = await t.query(api.opportunities.getOpportunityDetail, {
			insightKey: seed.insightKey,
			meetingKey: seed.march20MeetingKey
		});

		expect(myDealsList).not.toHaveProperty('header');
		expect(myDealsList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.dealKey,
					detail: {
						dealKey: seed.dealKey,
						defaultTab: 'news'
					}
				})
			])
		);
		expect(myDealsDetail?.title).toBe('Acme Expansion');
		expect(getIndustryRow(myDealsDetail!)).toMatchObject({ dealKey: seed.dealKey });

		expect(newBusinessList).not.toHaveProperty('header');
		expect(newBusinessList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.dealKey,
					hasDetail: true
				})
			])
		);
		expect(newBusinessDetail?.title).toBe('Acme Expansion');
		expect(newBusinessDetail?.orgChartNodes).toEqual(
			toExpectedDashboardOrgChartNodes(seed.dealOrgChartNodes, seed)
		);

		expect(sinceLastMeeting.deals).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.dealKey,
					hasDetail: true
				})
			])
		);
		expect(sinceLastMeetingDetail?.title).toBe('Acme Expansion');
		expect(sinceLastMeetingDetail?.orgChartNodes).toEqual(
			toExpectedDashboardOrgChartNodes(seed.dealOrgChartNodes, seed)
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
			t.query(api.myDeals.getMyDealsDetail, {
				dealKey: 'not-a-deal-key',
				brokerKey: seed.collaboratorBrokerKey,
				view: 'news'
			})
		).resolves.toBeNull();
		await expect(
			t.query(api.newBusiness.getNewBusinessDetail, {
				dealKey: 'bad-deal-key'
			})
		).resolves.toBeNull();
		await expect(
			t.query(api.sinceLastMeeting.getSinceLastMeetingDetail, {
				meetingKey: seed.march20MeetingKey,
				dealKey: 'bad-deal-key'
			})
		).resolves.toBeNull();
		await expect(
			t.query(api.opportunities.getOpportunityDetail, {
				insightKey: 'bad-insight-key',
				meetingKey: seed.march20MeetingKey
			})
		).resolves.toBeNull();
	});

	it('normalizes legacy nested org charts for deals and insights', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);
		const legacyDealKey = 'legacy-org-chart' as DealKey;
		const legacyInsightKey = 'legacy-risk-insight' as InsightKey;

		await t.run(async (ctx) => {
			await ctx.db.insert(
				'deals',
				{
					key: legacyDealKey,
					dealNumber: 404,
					industry: 'Industrials',
					dealName: 'Legacy Org Chart',
					isReservedInEpic: false,
					probability: 55,
					stage: 'Proposal',
					isLikelyOutOfDate: false,
					activityLevel: 'medium',
					lastActivityAtIso: '2026-03-24T10:00:00Z',
					ownerBrokerId: seed.ownerBrokerId,
					collaboratorBrokerIds: [seed.collaboratorBrokerId],
					context: {
						summary: 'Stored before org chart flattening.',
						claimedAtIso: '2026-03-10T09:00:00Z',
						orgChartRoot: {
							id: 'legacy-root',
							name: 'Alex Morgan',
							role: 'CFO',
							lastContactedByBrokerId: seed.ownerBrokerId,
							lastContactedOnIso: '2026-03-21',
							directReports: [
								{
									id: 'legacy-child',
									name: 'Taylor Smith',
									role: 'VP Finance',
									lastContactedByBrokerId: seed.collaboratorBrokerId,
									lastContactedOnIso: '2026-03-22'
								}
							]
						}
					},
					dashboardFlags: {
						needsSupport: false,
						duplicatedWork: false
					}
				} as never
			);

			await ctx.db.insert(
				'insights',
				{
					key: legacyInsightKey,
					dealId: seed.dealId,
					meetingId: seed.march20MeetingId,
					kind: 'risk',
					title: 'Legacy Risk Insight',
					ownerBrokerId: seed.ownerBrokerId,
					collaboratorBrokerIds: [seed.collaboratorBrokerId],
					timeline: [
						{
							id: 'legacy-risk-1',
							dealId: seed.dealId,
							stream: 'deal-detail',
							occurredOnIso: '2026-03-23',
							body: 'Legacy insight still needs flattening.',
							marker: { kind: 'dot' },
							title: 'Legacy note'
						}
					],
					orgChartRoot: {
						id: 'legacy-insight-root',
						name: 'Jordan Lee',
						role: 'Chief Procurement Officer',
						lastContactedByBrokerId: seed.ownerBrokerId,
						lastContactedOnIso: '2026-03-23',
						directReports: [
							{
								id: 'legacy-insight-child',
								name: 'Sam Rivera',
								role: 'Security Lead',
								lastContactedByBrokerId: seed.collaboratorBrokerId,
								lastContactedOnIso: '2026-03-24'
							}
						]
					}
				} as never
			);
		});

		const newBusinessDetail = await t.query(api.newBusiness.getNewBusinessDetail, {
			dealKey: legacyDealKey
		});
		const opportunityDetail = await t.query(api.opportunities.getOpportunityDetail, {
			insightKey: legacyInsightKey,
			meetingKey: seed.march20MeetingKey
		});

		expect(newBusinessDetail?.orgChartNodes).toEqual([
			{
				id: 'legacy-root',
				name: 'Alex Morgan',
				role: 'CFO',
				parentId: undefined,
				lastContactedByBrokerKey: seed.ownerBrokerKey,
				lastContactedOnIso: '2026-03-21'
			},
			{
				id: 'legacy-child',
				parentId: 'legacy-root',
				name: 'Taylor Smith',
				role: 'VP Finance',
				lastContactedByBrokerKey: seed.collaboratorBrokerKey,
				lastContactedOnIso: '2026-03-22'
			}
		]);
		expect(opportunityDetail?.orgChartNodes).toEqual([
			{
				id: 'legacy-insight-root',
				name: 'Jordan Lee',
				role: 'Chief Procurement Officer',
				parentId: undefined,
				lastContactedByBrokerKey: seed.ownerBrokerKey,
				lastContactedOnIso: '2026-03-23'
			},
			{
				id: 'legacy-insight-child',
				parentId: 'legacy-insight-root',
				name: 'Sam Rivera',
				role: 'Security Lead',
				lastContactedByBrokerKey: seed.collaboratorBrokerKey,
				lastContactedOnIso: '2026-03-24'
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

	it('scopes since-last-meeting activity and my-deals news to the selected reference period', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const sinceLastMeeting = await t.query(api.sinceLastMeeting.getSinceLastMeeting, {
			meetingKey: seed.march20MeetingKey
		});
		const myDealsList = await t.query(api.myDeals.getMyDealsList, {
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});

		expect(sinceLastMeeting.referenceMeetingDateIso).toBe('2026-03-20');
		expect(sinceLastMeeting.timelineItems).toHaveLength(1);
		expect(sinceLastMeeting.timelineItems[0]).toMatchObject({
			kind: 'headline',
			title: 'Fresh update'
		});
		expect(sinceLastMeeting.deals).toEqual([
			expect.objectContaining({
				key: seed.dealKey
			})
		]);

		expect(myDealsList.newsItems).toEqual([
			expect.objectContaining({
				title: 'Acme opens a new distribution hub',
				dateIso: '2026-03-25'
			})
		]);
	});

	it('updates industry through the canonical deal key contract', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		await expect(
			t.action(api.mutations.updateDealIndustry, {
				dealKey: seed.dealKey,
				industry: 'Food & beverage'
			})
		).resolves.toBe('updated');
		await expect(
			t.action(api.mutations.updateDealIndustry, {
				dealKey: 'not-a-deal-key' as DealKey,
				industry: 'Food & beverage'
			})
		).resolves.toBe('not-found');

		const updatedDeal = await t.run(async (ctx) => ctx.db.get(seed.dealId));
		expect(updatedDeal?.industry).toBe('Food & beverage');
	});
});
