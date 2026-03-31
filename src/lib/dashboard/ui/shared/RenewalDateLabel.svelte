<script lang="ts">
	import { formatIsoDateLong } from '$lib/format/date-time';
	import { cn } from '$lib/support/cn';
	import { isIsoDatePast, type IsoDate } from '$lib/types/dates';

	type Props = {
		renewalDate?: IsoDate;
		emptyLabel?: string;
		class?: string;
	};

	let {
		renewalDate,
		emptyLabel = 'No renewal date',
		class: classProp = ''
	}: Props = $props();

	let label = $derived(renewalDate ? formatIsoDateLong(renewalDate) : emptyLabel);
	let isPastDue = $derived(renewalDate ? isIsoDatePast(renewalDate) : false);
	let className = $derived(
		isPastDue
			? cn(
					'inline-flex items-center rounded-md border border-red-100/70 bg-red-50/70 px-2 py-0.5 text-[11px] tracking-wide text-red-500',
					classProp
				)
			: classProp
	);
</script>

<span class={className}>{label}</span>
