export const WAITING_STATUS_TEXT = 'Waiting for update' as const;
export const WAITING_STATUS_SCREEN_READER_LABEL = 'Waiting for update...' as const;
export const MAX_WAITING_STATUS_DOTS = 3 as const;

export const WAITING_STATUS_ANIMATION_STEPS = [
	{ visibleDotCount: 1, durationMs: 700 },
	{ visibleDotCount: 2, durationMs: 700 },
	{ visibleDotCount: 3, durationMs: 700 },
	{ visibleDotCount: 1, durationMs: 700 },
	{ visibleDotCount: 2, durationMs: 700 },
	{ visibleDotCount: 3, durationMs: 700 },
	{ visibleDotCount: 3, durationMs: 1800 }
] as const;

export type WaitingStatusAnimationStep = (typeof WAITING_STATUS_ANIMATION_STEPS)[number];
