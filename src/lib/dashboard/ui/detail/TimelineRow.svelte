<script lang="ts">
	import { formatIsoDateTimeDate } from '$lib/format/date-time';
	import type { TimelineItem } from '$lib/dashboard/view-models/account-content';
	import {
		ASK_FOR_UPDATE_ACTION_LABEL,
		formatAskForUpdateBody
	} from '$lib/dashboard/view-models/ask-for-update';
	import PersonAvatar from '$lib/dashboard/ui/people/PersonAvatar.svelte';
	import WaitingStatusText from '$lib/dashboard/ui/shared/WaitingStatusText.svelte';
	import { cn } from '$lib/support/cn';
	import { getMarkerStyle, getRowStyle, TIMELINE_LAYOUT } from './timeline-layout';

	type Props = {
		item: TimelineItem;
		showConnector?: boolean;
	};

	let { item, showConnector = false }: Props = $props();

	const isCallout = $derived(item.presentation === 'callout');
	const rowPaddingStyle = $derived(
		showConnector ? `padding-bottom:${TIMELINE_LAYOUT.rowSpacing}px;` : ''
	);
	const connectorStyle = $derived(
		`left:${TIMELINE_LAYOUT.laneWidth / 2}px;top:${TIMELINE_LAYOUT.headlineHeight}px;`
	);
	const calloutSurfaceStyle = $derived(
		`left:-${TIMELINE_LAYOUT.calloutInsetX}px;right:-${TIMELINE_LAYOUT.calloutInsetX}px;top:-${TIMELINE_LAYOUT.calloutInsetY}px;bottom:-${TIMELINE_LAYOUT.calloutInsetY}px;`
	);
</script>

<li class="relative" style={rowPaddingStyle}>
	{#if showConnector}
		<span
			aria-hidden="true"
			class="pointer-events-none absolute bottom-0 w-px -translate-x-1/2 bg-zinc-200"
			style={connectorStyle}
		></span>
	{/if}

	<div class="relative grid items-start" style={getRowStyle()}>
		{#if isCallout}
			<div
				aria-hidden="true"
				class="pointer-events-none absolute rounded-lg border border-zinc-200/50 bg-white"
				style={calloutSurfaceStyle}
			></div>
		{/if}

		<div
			class={cn(
				'relative flex shrink-0 items-center justify-center self-start rounded-full',
				isCallout ? 'bg-white' : 'bg-(--panel-bg)'
			)}
			style={getMarkerStyle(TIMELINE_LAYOUT.markerShellSize)}
		>
			{#if item.marker.kind === 'avatar'}
				<PersonAvatar person={item.marker.person} size={TIMELINE_LAYOUT.avatarSize} />
			{:else}
				<span
					aria-hidden="true"
					class="inline-flex rounded-full bg-zinc-300"
					style={getMarkerStyle(TIMELINE_LAYOUT.dotSize)}
				></span>
			{/if}
		</div>

		<div class="relative min-w-0">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1" style={`min-height:${TIMELINE_LAYOUT.headlineHeight}px;`}>
				{#if item.kind === 'actor-action'}
					<h2 class="min-w-0 flex-1 text-xs leading-5 tracking-wide text-zinc-700">
						<span class="font-medium text-zinc-800">{item.actor.name}</span>
						<span> {item.action}</span>
					</h2>
				{:else if item.kind === 'ask-for-update'}
					<h2 class="min-w-0 flex-1 text-xs leading-5 tracking-wide text-zinc-700">
						<span class="font-medium text-zinc-800">{item.actor.name}</span>
						<span> {ASK_FOR_UPDATE_ACTION_LABEL}</span>
					</h2>
				{:else}
					<h2 class="min-w-0 flex-1 text-xs leading-5 font-medium tracking-wide text-zinc-700">{item.title}</h2>
				{/if}
				<p class="text-xs leading-5 tracking-wide text-zinc-400">
					{formatIsoDateTimeDate(item.occurredAtIso)}
				</p>
			</div>
			<p class="mt-1 text-xs leading-relaxed tracking-wide text-zinc-600">
				{#if item.kind === 'ask-for-update'}
					{#if item.status === 'waiting'}
						<WaitingStatusText />
					{:else}
						{formatAskForUpdateBody(item.status)}
					{/if}
				{:else}
					{item.body}
				{/if}
			</p>
		</div>
	</div>
</li>
