<script lang="ts">
	import { DEAL_INDUSTRIES, type DealIndustry } from '$lib/types/vocab';
	import IndustryPicker from '$lib/dashboard/ui/pickers/IndustryPicker.svelte';
	import type { DealKey } from '$lib/types/keys';

	type Props = {
		dealKey: DealKey;
		industry: DealIndustry;
		formAction?: string;
	};

	let { dealKey, industry, formAction = '?/updateIndustry' }: Props = $props();
	let formElement = $state<HTMLFormElement | null>(null);
	let dealKeyInput = $state<HTMLInputElement | null>(null);
	let industryInput = $state<HTMLInputElement | null>(null);

	function submitIndustrySelection(nextIndustry: DealIndustry) {
		if (nextIndustry === industry || !formElement || !industryInput || !dealKeyInput) {
			return;
		}

		dealKeyInput.value = dealKey;
		industryInput.value = nextIndustry;
		formElement.requestSubmit();
	}
</script>

<form bind:this={formElement} method="POST" action={formAction} class="w-full">
	<input bind:this={dealKeyInput} type="hidden" name="dealKey" value={dealKey} />
	<input bind:this={industryInput} type="hidden" name="industry" value={industry} />
	<IndustryPicker
		summary={industry}
		options={DEAL_INDUSTRIES.map((option) => ({ id: option, label: option }))}
		selectedValue={industry}
		onSelect={submitIndustrySelection}
		searchLabel="Search industries"
		searchPlaceholder="Search industries"
	/>
</form>
