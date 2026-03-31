import { describe, expect, it } from 'vitest';
import { isIsoDatePast } from './dates';

describe('isIsoDatePast', () => {
	it('treats earlier UTC days as past', () => {
		expect(isIsoDatePast('2026-03-29', new Date('2026-03-30T12:00:00Z'))).toBe(true);
	});

	it('does not treat the current UTC day as past', () => {
		expect(isIsoDatePast('2026-03-30', new Date('2026-03-30T23:59:59Z'))).toBe(false);
	});

	it('does not treat future UTC days as past', () => {
		expect(isIsoDatePast('2026-03-31', new Date('2026-03-30T12:00:00Z'))).toBe(false);
	});
});
