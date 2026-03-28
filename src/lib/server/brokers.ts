import { env } from '$env/dynamic/private';
import { parseBrokerKey, type BrokerKey } from '$lib/types/keys';

type BrokerEnv = Record<string, string | undefined>;

export const DEFAULT_BROKER_KEY_ENV_VAR = 'DEFAULT_BROKER_KEY';

export function resolveDefaultBrokerKey(brokerEnv: BrokerEnv = env): BrokerKey {
	const defaultBrokerKey = parseBrokerKey(brokerEnv.DEFAULT_BROKER_KEY?.trim() ?? null);

	if (defaultBrokerKey) {
		return defaultBrokerKey;
	}

	throw new Error(
		`Missing ${DEFAULT_BROKER_KEY_ENV_VAR}. Set it to the default broker key for My Deals.`
	);
}
