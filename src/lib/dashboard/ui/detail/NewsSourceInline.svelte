<script lang="ts">
	import { Rss } from 'lucide-svelte';
	import type { DealNewsSource } from '$lib/types/vocab';

	type Props = {
		source: DealNewsSource;
		text: string;
	};

	let { source, text }: Props = $props();
</script>

<span class="flex min-w-0 w-full items-center gap-1.5">
	{#if source === 'linkedin'}
		<svg viewBox="0 0 24 24" aria-hidden="true" class="size-3 shrink-0 fill-current text-zinc-400">
			<path d="M4.98 3.5a2.49 2.49 0 1 1 0 4.98 2.49 2.49 0 0 1 0-4.98ZM3 8.98h3.96V21H3zm6.48 0h3.8v1.64h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.08V21h-3.96v-5.66c0-1.35-.02-3.09-1.88-3.09-1.88 0-2.17 1.47-2.17 2.99V21H9.48z" />
		</svg>
	{:else}
		<Rss class="size-3 shrink-0 text-zinc-400" />
	{/if}
	<span class="min-w-0 flex-1 truncate" title={text}>{text}</span>
</span>
