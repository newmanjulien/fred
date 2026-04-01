import { describe, expect, it } from 'vitest';
import { getLeadershipTableFooterContent } from './footer-content';

describe('getLeadershipTableFooterContent', () => {
	it('prioritizes selected rows over waiting rows', () => {
		expect(
			getLeadershipTableFooterContent({
				defaultText: 'All the new business your brokers are working on',
				selectedRowCount: 2,
				visibleRows: [
					{
						lastActivity: {
							kind: 'waiting-for-update',
							occurredAtIso: '2026-03-31T10:00:00Z'
						}
					}
				]
			})
		).toMatchObject({
			kind: 'selected',
			showLearnMore: true
		});
	});

	it('uses singular waiting copy when one visible row is waiting for an update', () => {
		expect(
			getLeadershipTableFooterContent({
				defaultText: 'All the renewals your brokers are working on',
				selectedRowCount: 0,
				visibleRows: [
					{
						lastActivity: {
							kind: 'waiting-for-update',
							occurredAtIso: '2026-03-31T10:00:00Z'
						}
					}
				]
			})
		).toEqual({
			kind: 'waiting',
			message: "You requested an update and we're waiting for the broker to answer",
			showLearnMore: true
		});
	});

	it('falls back to the default footer text when nothing is selected or waiting', () => {
		expect(
			getLeadershipTableFooterContent({
				defaultText: 'All the renewals your brokers are working on',
				selectedRowCount: 0,
				visibleRows: [
					{
						lastActivity: {
							kind: 'activity',
							occurredAtIso: '2026-03-31T10:00:00Z'
						}
					}
				]
			})
		).toEqual({
			kind: 'default',
			message: 'All the renewals your brokers are working on',
			showLearnMore: false
		});
	});
});
