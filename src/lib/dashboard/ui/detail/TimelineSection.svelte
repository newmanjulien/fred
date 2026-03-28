<script lang="ts">
	import { formatIsoDate } from '$lib/format/date-time';
	import type { TimelineItem } from '$lib/dashboard/view-models/deal-content';
	import PersonAvatar from '$lib/dashboard/ui/people/PersonAvatar.svelte';

	type Props = {
		items: readonly TimelineItem[];
	};

	let { items }: Props = $props();

	const TIMELINE_LAYOUT = {
		laneWidth: 24,
		columnGap: 16,
		headlineHeight: 24,
		rowSpacing: 24,
		markerShellSize: 24,
		avatarSize: 16,
		dotSize: 6
	} as const;

	function markerStyle(size: number) {
		return `width:${size}px;height:${size}px;`;
	}
</script>

<ol class="pt-1">
	{#each items as item, index (item.id)}
		<li
			class="relative grid"
			style={`grid-template-columns:${TIMELINE_LAYOUT.laneWidth}px minmax(0,1fr);column-gap:${TIMELINE_LAYOUT.columnGap}px;${index === items.length - 1 ? '' : `padding-bottom:${TIMELINE_LAYOUT.rowSpacing}px;`}`}
		>
			{#if index !== items.length - 1}
				<span
					aria-hidden="true"
					class="pointer-events-none absolute bottom-0 w-px -translate-x-1/2 bg-zinc-200"
					style={`left:${TIMELINE_LAYOUT.laneWidth / 2}px;top:${TIMELINE_LAYOUT.headlineHeight}px;`}
				></span>
			{/if}

			<div
				class="relative flex shrink-0 items-center justify-center self-start rounded-full bg-(--panel-bg)"
				style={markerStyle(TIMELINE_LAYOUT.markerShellSize)}
			>
				{#if item.marker.kind === 'avatar'}
					<PersonAvatar person={item.marker.person} size={TIMELINE_LAYOUT.avatarSize} />
				{:else}
					<span
						aria-hidden="true"
						class="inline-flex rounded-full bg-zinc-300"
						style={markerStyle(TIMELINE_LAYOUT.dotSize)}
					></span>
				{/if}
			</div>

			<div class="min-w-0">
				<div class="flex flex-wrap items-center gap-x-2 gap-y-1" style={`min-height:${TIMELINE_LAYOUT.headlineHeight}px;`}>
					{#if item.kind === 'actor-action'}
						<h2 class="min-w-0 flex-1 text-xs leading-5 tracking-wide text-zinc-700">
							<span class="font-medium text-zinc-800">{item.actor.name}</span>
							<span> {item.action}</span>
						</h2>
					{:else}
						<h2 class="min-w-0 flex-1 text-xs leading-5 font-medium tracking-wide text-zinc-700">
							{item.title}
						</h2>
					{/if}
					<p class="text-xs leading-5 tracking-wide text-zinc-400">
						{formatIsoDate(item.occurredOnIso)}
					</p>
				</div>
				<p class="mt-1 text-xs leading-relaxed tracking-wide text-zinc-600">{item.body}</p>
			</div>
		</li>
	{/each}
</ol>
