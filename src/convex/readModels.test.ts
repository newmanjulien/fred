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
		occurredAtIso: '2026-03-20T10:00:00.000Z',
		body: 'Called the buyer.',
		marker: {
			kind: 'dot'
		},
		...overrides
	} as Parameters<typeof toActivityRecord>[0];
}

function createAskForUpdateActivity(
	overrides: Partial<Parameters<typeof toActivityRecord>[0]>
): Parameters<typeof toActivityRecord>[0] {
	return {
		_creationTime: 1710000000000,
		accountId: 'account-1',
		stream: 'account-detail',
		occurredAtIso: '2026-03-20T10:00:00.000Z',
		eventKind: 'ask-for-update',
		updateRequestStatus: 'waiting',
		marker: {
			kind: 'broker-avatar',
			brokerId: 'broker-1' as BrokerId
		},
		actorBrokerId: 'broker-2' as BrokerId,
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
			occurredAtIso: '2026-03-20T10:00:00.000Z',
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
				createAskForUpdateActivity({
					updateRequestStatus: 'provided'
				})
			)
		).toEqual({
			kind: 'ask-for-update',
			id: 'activity-1710000000000',
			accountId: 'account-1',
			stream: 'account-detail',
			occurredAtIso: '2026-03-20T10:00:00.000Z',
			marker: {
				kind: 'broker-avatar',
				brokerRef: 'broker-1'
			},
			actorBrokerRef: 'broker-2',
			status: 'provided'
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
