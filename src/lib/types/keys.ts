type Brand<TValue extends string, TBrand extends string> = TValue & {
	readonly __brand: TBrand;
};

export type BrokerKey = Brand<string, 'BrokerKey'>;
export type DealKey = Brand<string, 'DealKey'>;
export type InsightKey = Brand<string, 'InsightKey'>;
export type MeetingKey = Brand<string, 'MeetingKey'>;

function toKey<TBrand extends string>(value: string): Brand<string, TBrand> {
	return value as Brand<string, TBrand>;
}

function parseKey<TBrand extends string>(value: unknown): Brand<string, TBrand> | null {
	return typeof value === 'string' && value.length > 0 ? toKey<TBrand>(value) : null;
}

export function toBrokerKey(value: string): BrokerKey {
	return toKey<'BrokerKey'>(value);
}

export function toDealKey(value: string): DealKey {
	return toKey<'DealKey'>(value);
}

export function toInsightKey(value: string): InsightKey {
	return toKey<'InsightKey'>(value);
}

export function toMeetingKey(value: string): MeetingKey {
	return toKey<'MeetingKey'>(value);
}

export function parseBrokerKey(value: unknown): BrokerKey | null {
	return parseKey<'BrokerKey'>(value);
}

export function parseDealKey(value: unknown): DealKey | null {
	return parseKey<'DealKey'>(value);
}

export function parseInsightKey(value: unknown): InsightKey | null {
	return parseKey<'InsightKey'>(value);
}

export function parseMeetingKey(value: unknown): MeetingKey | null {
	return parseKey<'MeetingKey'>(value);
}
