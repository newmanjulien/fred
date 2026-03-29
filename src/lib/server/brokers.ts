import { env } from '$env/dynamic/private';
import { parseBrokerKey, type BrokerKey } from '$lib/types/keys';

type BrokerEnv = Record<string, string | undefined>;
type BrokerRecord<TKey extends BrokerKey = BrokerKey> = {
	key: TKey;
};

export const DEFAULT_BROKER_KEY_ENV_VAR = 'DEFAULT_BROKER_KEY';

export function resolveDefaultBrokerKey(brokerEnv: BrokerEnv = env): BrokerKey {
	const defaultBrokerKey = parseBrokerKey(brokerEnv.DEFAULT_BROKER_KEY?.trim() ?? null);

	if (defaultBrokerKey) {
		return defaultBrokerKey;
	}

	throw new Error(
		`Missing ${DEFAULT_BROKER_KEY_ENV_VAR}. Set it to the default broker key for My Accounts.`
	);
}

export function findBrokerByKey<TBroker extends BrokerRecord>(
	brokers: readonly TBroker[],
	brokerKey: BrokerKey
): TBroker | null {
	return brokers.find((broker) => broker.key === brokerKey) ?? null;
}

export function requireBrokerByKey<TBroker extends BrokerRecord>(
	brokers: readonly TBroker[],
	brokerKey: BrokerKey,
	onMissing: (brokerKey: BrokerKey) => never
): TBroker {
	const broker = findBrokerByKey(brokers, brokerKey);

	if (!broker) {
		return onMissing(brokerKey);
	}

	return broker;
}
