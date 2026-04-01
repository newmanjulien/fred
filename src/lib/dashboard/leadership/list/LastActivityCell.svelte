<script lang="ts">
	import { formatIsoDateTimeRelative } from '$lib/format/date-time';
	import type { AccountListRowReadModel } from '$lib/dashboard/read-models';
	import WaitingStatusText from '$lib/dashboard/ui/shared/WaitingStatusText.svelte';

	const NO_ACTIVITY_LABEL = 'No recorded activity';

	type Props = {
		lastActivity: AccountListRowReadModel['lastActivity'];
	};

	let { lastActivity }: Props = $props();
</script>

{#if lastActivity.kind === 'activity'}
	{formatIsoDateTimeRelative(lastActivity.occurredAtIso)}
{:else if lastActivity.kind === 'waiting-for-update'}
	<WaitingStatusText />
{:else}
	{NO_ACTIVITY_LABEL}
{/if}
