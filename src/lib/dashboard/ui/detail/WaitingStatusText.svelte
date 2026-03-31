<script lang="ts">
	import { onMount } from 'svelte';
	import {
		MAX_WAITING_STATUS_DOTS,
		WAITING_STATUS_ANIMATION_STEPS,
		WAITING_STATUS_SCREEN_READER_LABEL,
		WAITING_STATUS_TEXT
	} from './waiting-status';

	const visibleDotSlots = [1, 2, 3] as const;

	let visibleDotCount = $state<number>(WAITING_STATUS_ANIMATION_STEPS[0].visibleDotCount);

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let stepIndex = 0;

		function clearStepTimer() {
			if (timeoutId === null) {
				return;
			}

			clearTimeout(timeoutId);
			timeoutId = null;
		}

		function runStep() {
			const step = WAITING_STATUS_ANIMATION_STEPS[stepIndex];
			visibleDotCount = step.visibleDotCount;
			clearStepTimer();
			timeoutId = setTimeout(() => {
				stepIndex = (stepIndex + 1) % WAITING_STATUS_ANIMATION_STEPS.length;
				runStep();
			}, step.durationMs);
		}

		function syncMotionPreference() {
			clearStepTimer();

			if (mediaQuery.matches) {
				visibleDotCount = MAX_WAITING_STATUS_DOTS;
				return;
			}

			stepIndex = 0;
			runStep();
		}

		function handlePreferenceChange() {
			syncMotionPreference();
		}

		syncMotionPreference();
		mediaQuery.addEventListener('change', handlePreferenceChange);

		return () => {
			clearStepTimer();
			mediaQuery.removeEventListener('change', handlePreferenceChange);
		};
	});
</script>

<span class="sr-only">{WAITING_STATUS_SCREEN_READER_LABEL}</span>
<span aria-hidden="true" class="waiting-status">
	<span>{WAITING_STATUS_TEXT}</span>
	<span class="waiting-status-dots">
		{#each visibleDotSlots as dotNumber (dotNumber)}
			<span
				class:waiting-status-dot-visible={dotNumber <= visibleDotCount}
				class="waiting-status-dot"
				>.</span
			>
		{/each}
	</span>
</span>

<style>
	.waiting-status {
		display: inline-flex;
		align-items: baseline;
		white-space: nowrap;
	}

	.waiting-status-dots {
		display: inline-flex;
		white-space: nowrap;
		letter-spacing: 0;
		line-height: inherit;
	}

	.waiting-status-dot {
		display: inline-block;
		visibility: hidden;
	}

	.waiting-status-dot-visible {
		visibility: visible;
	}
</style>
