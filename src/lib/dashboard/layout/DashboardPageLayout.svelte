<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CanvasHeroData, CanvasHeroIcon } from '$lib/dashboard/ui/detail/CanvasHero.types';
	import CanvasHero from '$lib/dashboard/ui/detail/CanvasHero.svelte';
	import { cn } from '$lib/support/cn';
	import {
		getDashboardLayoutMaxWidth,
		type DashboardLayoutWidth
	} from './tokens';

	type Props = {
		hero?: CanvasHeroData;
		icon?: CanvasHeroIcon;
		width?: DashboardLayoutWidth;
		class?: string;
		body?: Snippet;
	};

	let {
		hero,
		icon,
		width = 'normal',
		class: classProp = '',
		body
	}: Props = $props();

	const maxWidth = $derived(getDashboardLayoutMaxWidth(width));
</script>

<div class={cn('relative mx-auto w-full', classProp)} style={`max-width: ${maxWidth};`}>
	<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
		<CanvasHero {hero} {icon} />
		{#if body}
			{@render body()}
		{/if}
	</div>
</div>
