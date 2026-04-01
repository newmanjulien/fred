<script lang="ts">
	import { Info } from 'lucide-svelte';
	import type { AccountListRowReadModel } from '$lib/dashboard/read-models';
	import {
		getLeadershipTableFooterContent,
		type LeadershipTableFooterContent
	} from './footer-content';

	type LeadershipFooterRow = Pick<AccountListRowReadModel, 'lastActivity'>;

	type Props = {
		defaultText?: string | null;
		visibleRows: readonly LeadershipFooterRow[];
		selectedRowCount?: number;
	};

	let { defaultText, visibleRows, selectedRowCount = 0 }: Props = $props();

	const content = $derived<LeadershipTableFooterContent>(
		getLeadershipTableFooterContent({
			defaultText,
			visibleRows,
			selectedRowCount
		})
	);
</script>

{#if content.kind !== 'none'}
	<div class="flex min-w-0 items-start gap-2">
		<Info aria-hidden="true" class="mt-0.5 size-3.5 shrink-0 text-zinc-500" />
		<p class="min-w-0 text-xs leading-relaxed tracking-wide text-zinc-500">
			{content.message}
			{#if content.showLearnMore}
				<button
					type="button"
					class="ml-1.5 underline underline-offset-2 transition-colors hover:text-zinc-700"
				>
					Learn more
				</button>
			{/if}
		</p>
	</div>
{/if}
