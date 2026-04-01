<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';

	type Props = {
		text?: string | null;
		content?: Snippet;
		dataAttribute?: string;
		class?: string;
	};

	let { text, content, dataAttribute, class: classProp = '' }: Props = $props();
</script>

{#if content || text?.trim()}
	<div
		class={cn('mt-3 rounded-sm border border-zinc-100 bg-zinc-50/35 px-3 py-2', classProp)}
		{...(dataAttribute ? { [dataAttribute]: true } : {})}
	>
		{#if content}
			{@render content()}
		{:else if text?.trim()}
			<p class="text-xs leading-relaxed tracking-wide text-zinc-500">{text}</p>
		{/if}
	</div>
{/if}
