import { describe, expect, it } from 'vitest';
import type { BrokerId } from '../lib/types/ids';
import { toActivityRecord } from './readModels';

function createActivity(
	overrides: Partial<Parameters<typeof toActivityRecord>[0]>
): Parameters<typeof toActivityRecord>[0] {
	return {
		_creationTime: 1710000000000,
		accountId: 'account-1',
		stream: 'account-detail',
		occurredOnIso: '2026-03-20',
		body: 'Called the buyer.',
		marker: {
			kind: 'dot'
		},
		...overrides
	} as Parameters<typeof toActivityRecord>[0];
}

describe('toActivityRecord', () => {
	it('maps headline activities through the shared base mapper', () => {
		expect(
			toActivityRecord(
				createActivity({
					id: 'headline-1',
					title: 'Budget approved'
				})
			)
		).toEqual({
			kind: 'headline',
			id: 'headline-1',
			accountId: 'account-1',
			stream: 'account-detail',
			occurredOnIso: '2026-03-20',
			body: 'Called the buyer.',
			marker: {
				kind: 'dot'
			},
			title: 'Budget approved'
		});
	});

	it('maps actor-action activities through the shared base mapper', () => {
		expect(
			toActivityRecord(
				createActivity({
					marker: {
						kind: 'broker-avatar',
						brokerId: 'broker-1' as BrokerId
					},
					actorBrokerId: 'broker-2' as BrokerId,
					action: 'sent pricing'
				})
			)
		).toEqual({
			kind: 'actor-action',
			id: 'activity-1710000000000',
			accountId: 'account-1',
			stream: 'account-detail',
			occurredOnIso: '2026-03-20',
			body: 'Called the buyer.',
			marker: {
				kind: 'broker-avatar',
				brokerRef: 'broker-1'
			},
			actorBrokerRef: 'broker-2',
			action: 'sent pricing'
		});
	});

	it('rejects activities with unsupported shapes', () => {
		expect(() =>
			toActivityRecord(
				createActivity({
					id: 'invalid-1'
				})
			)
		).toThrow('Invalid activity shape for "invalid-1".');
	});
});
