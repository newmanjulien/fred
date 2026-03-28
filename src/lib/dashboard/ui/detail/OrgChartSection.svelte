<script lang="ts">
	import type { OrgChartNode } from '$lib/dashboard/view-models/deal-content';

	type Props = {
		root: OrgChartNode;
	};

	let { root }: Props = $props();
</script>

<section class="rounded-sm border border-zinc-100 bg-white px-3 py-3">
	<div class="overflow-x-auto pb-1">
		<ol class="inline-flex min-w-full justify-center pt-1">
			{#snippet branch(node: OrgChartNode)}
				<li class="flex shrink-0 flex-col items-center">
					<article class="w-40 rounded-sm border border-zinc-100 bg-zinc-50/35 px-3 py-2">
						<h2 class="text-xs leading-relaxed font-medium tracking-wide text-zinc-900">{node.name}</h2>
						<p class="text-[11px] leading-relaxed tracking-wide text-zinc-500">{node.role}</p>
						<p class="mt-2 text-[10px] tracking-wide text-zinc-400">Last contact</p>
						<p class="text-[11px] leading-relaxed tracking-wide text-zinc-500">
							{node.lastContacted.by} on {node.lastContacted.on}
						</p>
					</article>

					{#if node.directReports?.length}
						<div class="mt-1 flex min-w-max flex-col items-center">
							<span aria-hidden="true" class="h-4 w-px bg-zinc-200"></span>
							<ol
								class={`flex items-start justify-center gap-3 px-2 pt-4 ${node.directReports.length > 1 ? 'border-t border-zinc-200' : ''}`}
								>
									{#each node.directReports as directReport (directReport.id)}
										{@render branch(directReport)}
									{/each}
							</ol>
						</div>
					{/if}
				</li>
			{/snippet}

			{@render branch(root)}
		</ol>
	</div>
</section>
