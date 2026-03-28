import type { BrokerKey } from '$lib/types/keys';

type BrokerOption = {
	key: BrokerKey;
};

export function resolveMyAccountsActiveBrokerKey(
	people: readonly BrokerOption[],
	defaultBrokerKey: BrokerKey
): BrokerKey {
	const activeBroker = people.find((person) => person.key === defaultBrokerKey);

	if (!activeBroker) {
		throw new Error(`Unknown default broker key "${defaultBrokerKey}".`);
	}

	return activeBroker.key;
}

export async function resolveMyAccountsActiveBrokerKeyFromParent(
	parent: () => Promise<{ dashboardShell: { people: readonly BrokerOption[] } }>,
	defaultBrokerKey: BrokerKey
) {
	const { dashboardShell } = await parent();

	return resolveMyAccountsActiveBrokerKey(dashboardShell.people, defaultBrokerKey);
}
