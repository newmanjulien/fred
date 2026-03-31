import { describe, expect, it } from 'vitest';
import type { BrokerKey } from '$lib/types/keys';
import { createPersonSummaryMap, toOrgChartRoot, toTimelineItem } from './account-content';

const julienBrokerKey = 'broker-julien' as BrokerKey;
const minaBrokerKey = 'broker-mina' as BrokerKey;

const peopleById = createPersonSummaryMap([
	{
		key: julienBrokerKey,
		name: 'Julien Newman',
		avatar: '/avatars/julien.png'
	},
	{
		key: minaBrokerKey,
		name: 'Mina Chen',
		avatar: '/avatars/mina.png'
	}
]);

function createOrgChartNode(
	overrides: Partial<Parameters<typeof toOrgChartRoot>[0][number]> &
		Pick<Parameters<typeof toOrgChartRoot>[0][number], 'id' | 'name' | 'role'>
): Parameters<typeof toOrgChartRoot>[0][number] {
	const { id, name, role, ...rest } = overrides;

	return {
		id,
		name,
		role,
		lastContactedByBrokerKey: julienBrokerKey,
		lastContactedOnIso: '2026-03-21',
		...rest
	};
}

describe('toOrgChartRoot', () => {
	it('rebuilds a nested org chart from flat nodes', () => {
		const root = toOrgChartRoot(
			[
				createOrgChartNode({ id: 'root', name: 'Alex Morgan', role: 'CFO' }),
				createOrgChartNode({
					id: 'vp-finance',
					parentId: 'root',
					name: 'Taylor Smith',
					role: 'VP Finance',
					lastContactedByBrokerKey: minaBrokerKey,
					lastContactedOnIso: '2026-03-22'
				}),
				createOrgChartNode({
					id: 'controller',
					parentId: 'vp-finance',
					name: 'Jordan Lee',
					role: 'Controller'
				})
			],
			peopleById
		);

		expect(root).toEqual({
			id: 'root',
			name: 'Alex Morgan',
			role: 'CFO',
			lastContacted: {
				by: 'Julien Newman',
				on: 'March 21, 2026'
			},
			directReports: [
				{
					id: 'vp-finance',
					name: 'Taylor Smith',
					role: 'VP Finance',
					lastContacted: {
						by: 'Mina Chen',
						on: 'March 22, 2026'
					},
					directReports: [
						{
							id: 'controller',
							name: 'Jordan Lee',
							role: 'Controller',
							lastContacted: {
								by: 'Julien Newman',
								on: 'March 21, 2026'
							}
						}
					]
				}
			]
		});
	});

	it('rejects broken graphs', () => {
		expect(() =>
			toOrgChartRoot(
				[
					createOrgChartNode({ id: 'root', name: 'Alex Morgan', role: 'CFO' }),
					createOrgChartNode({
						id: 'finance-a',
						parentId: 'finance-b',
						name: 'Taylor Smith',
						role: 'VP Finance'
					}),
					createOrgChartNode({
						id: 'finance-b',
						parentId: 'finance-a',
						name: 'Jordan Lee',
						role: 'Controller'
					})
				],
				peopleById
			)
		).toThrow('Org chart nodes are not reachable from root "root": finance-a, finance-b.');
	});
});

describe('toTimelineItem', () => {
	it('defaults ask-for-update cards to the waiting copy when no status is stored', () => {
		expect(
			toTimelineItem(
				{
					kind: 'actor-action',
					id: 'activity-1',
					occurredAtIso: '2026-03-21T10:00:00.000Z',
					body: 'Sent a notification to the broker.',
					eventKind: 'ask-for-update',
					marker: {
						kind: 'broker-avatar',
						brokerRef: julienBrokerKey
					},
					actorBrokerRef: julienBrokerKey,
					action: 'asked for an update'
				},
				peopleById
			)
		).toMatchObject({
			kind: 'actor-action',
			body: 'Waiting for update...',
			updateRequestStatus: 'waiting',
			presentation: 'callout'
		});
	});

	it('renders the provided copy when an ask-for-update has been fulfilled', () => {
		expect(
			toTimelineItem(
				{
					kind: 'actor-action',
					id: 'activity-2',
					occurredAtIso: '2026-03-21T10:00:00.000Z',
					body: 'Waiting for update...',
					eventKind: 'ask-for-update',
					updateRequestStatus: 'provided',
					marker: {
						kind: 'broker-avatar',
						brokerRef: minaBrokerKey
					},
					actorBrokerRef: minaBrokerKey,
					action: 'asked for an update'
				},
				peopleById
			)
		).toMatchObject({
			kind: 'actor-action',
			body: 'Update provided.',
			updateRequestStatus: 'provided',
			presentation: 'callout'
		});
	});
});
