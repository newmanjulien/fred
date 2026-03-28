import type { BrokerPickerOption } from '$lib/dashboard/ui/pickers/BrokerPickerPanel.svelte';

type BrokerPickerPerson<TKey extends string = string> = {
	key: TKey;
	name: string;
	avatar: string;
};

export function toBrokerPickerOptions<TKey extends string>(
	people: readonly BrokerPickerPerson<TKey>[]
): BrokerPickerOption<TKey>[] {
	return people.map((person) => ({
		id: person.key,
		label: person.name,
		avatar: person.avatar
	}));
}
