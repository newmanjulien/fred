<script lang="ts">
	import {
		WAITING_STATUS_CYCLE_DURATION_MS,
		WAITING_STATUS_SCREEN_READER_LABEL,
		WAITING_STATUS_TEXT
	} from './waiting-status';
</script>

<span class="sr-only">{WAITING_STATUS_SCREEN_READER_LABEL}</span>
<span
	aria-hidden="true"
	class="waiting-status"
	style={`--waiting-status-cycle-duration:${WAITING_STATUS_CYCLE_DURATION_MS}ms;`}
>
	<span>{WAITING_STATUS_TEXT}</span>
	<span class="waiting-status-dots">
		<span class="waiting-status-dot">.</span>
		<span class="waiting-status-dot waiting-status-dot-2">.</span>
		<span class="waiting-status-dot waiting-status-dot-3">.</span>
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
		display: inline-flex;
		width: 0.35em;
		justify-content: center;
	}

	.waiting-status-dot-2,
	.waiting-status-dot-3 {
		opacity: 0;
		animation-timing-function: steps(1, end);
		animation-iteration-count: infinite;
		animation-duration: var(--waiting-status-cycle-duration);
	}

	.waiting-status-dot-2 {
		animation-name: waiting-status-dot-2;
	}

	.waiting-status-dot-3 {
		animation-name: waiting-status-dot-3;
	}

	@keyframes waiting-status-dot-2 {
		0%,
		11.666% {
			opacity: 0;
		}

		11.667%,
		35% {
			opacity: 1;
		}

		35.001%,
		46.666% {
			opacity: 0;
		}

		46.667%,
		100% {
			opacity: 1;
		}
	}

	@keyframes waiting-status-dot-3 {
		0%,
		23.333% {
			opacity: 0;
		}

		23.334%,
		35% {
			opacity: 1;
		}

		35.001%,
		58.333% {
			opacity: 0;
		}

		58.334%,
		100% {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.waiting-status-dot-2,
		.waiting-status-dot-3 {
			opacity: 1;
			animation: none;
		}
	}
</style>
