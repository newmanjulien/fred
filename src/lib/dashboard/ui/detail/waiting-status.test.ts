import { describe, expect, it } from 'vitest';
import {
	MAX_WAITING_STATUS_DOTS,
	WAITING_STATUS_ANIMATION_STEPS
} from './waiting-status';

describe('WAITING_STATUS_ANIMATION_STEPS', () => {
	it('renders two passes followed by a full-dot pause', () => {
		expect(WAITING_STATUS_ANIMATION_STEPS.map((step) => step.visibleDotCount)).toEqual([
			1, 2, 3, 1, 2, 3, 3
		]);
	});

	it('holds the pause longer than the animated steps', () => {
		const animatedStepDuration = WAITING_STATUS_ANIMATION_STEPS[0].durationMs;
		const pauseStep = WAITING_STATUS_ANIMATION_STEPS[WAITING_STATUS_ANIMATION_STEPS.length - 1];

		expect(pauseStep.visibleDotCount).toBe(MAX_WAITING_STATUS_DOTS);
		expect(pauseStep.durationMs).toBeGreaterThan(animatedStepDuration);
	});
});
