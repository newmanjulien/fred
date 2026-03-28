<script lang="ts">
	import type { CanvasHeroData, CanvasHeroIcon } from './CanvasHero.types';
	import { formatDealNumber } from '$lib/dashboard/view-models/deal';
	import { cn } from '$lib/support/cn';

	type Props = {
		hero?: CanvasHeroData;
		icon?: CanvasHeroIcon;
	};

	let { hero, icon: Icon }: Props = $props();
	const hasHeaderMeta = $derived(Boolean(hero && (hero.dealNumber || Icon)));
</script>

{#if hero}
	<header class="mb-7 border-b border-zinc-100 pb-4">
		{#if hasHeaderMeta}
			<div class="space-y-2">
				{#if Icon}
					<div class="mb-4 inline-flex size-11 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
						<Icon class="size-5.5 text-current" />
					</div>
				{/if}
				{#if hero.dealNumber}
					<p class="text-xs tracking-wide text-zinc-400">{formatDealNumber(hero.dealNumber)}</p>
				{/if}
			</div>
		{/if}

		{#if hero.title}
			<h1 class={cn('text-sm font-medium tracking-wide text-zinc-900', hasHeaderMeta && 'mt-2')}>
				{hero.title}
			</h1>
		{/if}

		{#if hero.description}
				<p
					class={cn(
						'max-w-xl text-xs leading-relaxed tracking-wide text-zinc-500',
						hero.title && 'mt-1',
						!hero.title && hasHeaderMeta && 'mt-2'
					)}
				>
					{hero.description}
			</p>
		{/if}
	</header>
{/if}
