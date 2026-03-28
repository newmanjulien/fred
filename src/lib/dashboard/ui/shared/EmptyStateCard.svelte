<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';

	type Props = {
		title?: string;
		description?: string;
		class?: string;
		icon?: Snippet;
		body?: Snippet;
	};

	let {
		title,
		description,
		class: classProp = '',
		icon,
		body
	}: Props = $props();
</script>

<div class={cn('rounded-md border border-dashed border-zinc-200 bg-zinc-50/35 px-4 py-5', classProp)}>
	{#if body}
		{@render body()}
	{:else}
		<div class="flex items-start gap-3">
			{#if icon}
				<div class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500">
					{@render icon()}
				</div>
			{/if}

			<div class="min-w-0">
				{#if title}
					<h2 class="text-xs font-medium tracking-wide text-zinc-800">{title}</h2>
				{/if}
				{#if description}
					<p class={cn('max-w-xl text-xs leading-relaxed tracking-wide text-zinc-500', title && 'mt-1')}>
						{description}
					</p>
				{/if}
			</div>
		</div>
	{/if}
</div>
