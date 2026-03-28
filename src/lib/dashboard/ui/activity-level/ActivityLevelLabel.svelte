<script lang="ts">
	import {
		getActivityLevelIconVariant,
		getActivityLevelLabel
	} from '$lib/dashboard/view-models/deal';
	import ActivityLevelGridIcon from '$lib/dashboard/ui/activity-level/ActivityLevelGridIcon.svelte';
	import type { ActivityLevel } from '$lib/types/vocab';

	type Props = {
		activityLevel: ActivityLevel;
		class?: string;
	};

	let { activityLevel, class: classProp = '' }: Props = $props();
</script>

<span
	class={classProp
		? `inline-flex items-center gap-1 rounded-md border border-zinc-100 px-2 py-0.5 text-[11px] tracking-wide text-zinc-800 ${classProp}`
		: 'inline-flex items-center gap-1 rounded-md border border-zinc-100 px-2 py-0.5 text-[11px] tracking-wide text-zinc-800'}
>
	<ActivityLevelGridIcon
		variant={getActivityLevelIconVariant(activityLevel)}
		class="size-2.5 text-zinc-400"
	/>
	{getActivityLevelLabel(activityLevel)}
</span>
