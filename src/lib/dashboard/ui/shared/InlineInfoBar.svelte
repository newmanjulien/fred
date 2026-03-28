<script lang="ts">
	import { cn } from '$lib/support/cn';

	type Props = {
		text: string;
		dataAttribute?: string;
		class?: string;
	};

	let { text, dataAttribute, class: classProp = '' }: Props = $props();
</script>

<div
	class={cn('mt-3 rounded-sm border border-zinc-100 bg-zinc-50/35 px-3 py-2', classProp)}
	{...(dataAttribute ? { [dataAttribute]: true } : {})}
>
	<p class="text-xs leading-relaxed tracking-wide text-zinc-500">{text}</p>
</div>
