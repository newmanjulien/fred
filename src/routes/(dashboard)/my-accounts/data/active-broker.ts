import { requireBrokerByKey } from '$lib/server/brokers';
import type { BrokerKey } from '$lib/types/keys';

type BrokerOption = {
	key: BrokerKey;
};

export function resolveMyAccountsActiveBrokerKey(
	people: readonly BrokerOption[],
	defaultBrokerKey: BrokerKey
): BrokerKey {
	return requireBrokerByKey(people, defaultBrokerKey, (brokerKey) => {
		throw new Error(`Unknown default broker key "${brokerKey}".`);
	}).key;
}

export async function resolveMyAccountsActiveBrokerKeyFromParent(
	parent: () => Promise<{ dashboardShell: { people: readonly BrokerOption[] } }>,
	defaultBrokerKey: BrokerKey
) {
	const { dashboardShell } = await parent();

	return resolveMyAccountsActiveBrokerKey(dashboardShell.people, defaultBrokerKey);
}
