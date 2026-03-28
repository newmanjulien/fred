<script lang="ts">
	import { ACCOUNT_INDUSTRIES, type AccountIndustry } from '$lib/types/vocab';
	import IndustryPicker from '$lib/dashboard/ui/pickers/IndustryPicker.svelte';
	import type { AccountKey } from '$lib/types/keys';

	type Props = {
		accountKey: AccountKey;
		industry: AccountIndustry;
		formAction?: string;
	};

	let { accountKey, industry, formAction = '?/updateIndustry' }: Props = $props();
	let formElement = $state<HTMLFormElement | null>(null);
	let accountKeyInput = $state<HTMLInputElement | null>(null);
	let industryInput = $state<HTMLInputElement | null>(null);

	function submitIndustrySelection(nextIndustry: AccountIndustry) {
		if (nextIndustry === industry || !formElement || !industryInput || !accountKeyInput) {
			return;
		}

		accountKeyInput.value = accountKey;
		industryInput.value = nextIndustry;
		formElement.requestSubmit();
	}
</script>

<form bind:this={formElement} method="POST" action={formAction} class="w-full">
	<input bind:this={accountKeyInput} type="hidden" name="accountKey" value={accountKey} />
	<input bind:this={industryInput} type="hidden" name="industry" value={industry} />
	<IndustryPicker
		summary={industry}
		options={ACCOUNT_INDUSTRIES.map((option) => ({ id: option, label: option }))}
		selectedValue={industry}
		onSelect={submitIndustrySelection}
		searchLabel="Search industries"
		searchPlaceholder="Search industries"
	/>
</form>
