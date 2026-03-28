export type IsoDate = `${number}-${number}-${number}`;
export type IsoDateTime = `${IsoDate}T${string}`;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_TIME_PATTERN =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?Z$/;

function toInteger(value: string) {
	return Number.parseInt(value, 10);
}

function isValidUtcDate(value: string) {
	const match = ISO_DATE_PATTERN.exec(value);

	if (!match) {
		return false;
	}

	const [, yearPart, monthPart, dayPart] = match;
	const year = toInteger(yearPart);
	const month = toInteger(monthPart);
	const day = toInteger(dayPart);
	const date = new Date(`${value}T00:00:00.000Z`);

	return (
		!Number.isNaN(date.getTime()) &&
		date.getUTCFullYear() === year &&
		date.getUTCMonth() + 1 === month &&
		date.getUTCDate() === day
	);
}

function isValidUtcDateTime(value: string) {
	const match = ISO_DATE_TIME_PATTERN.exec(value);

	if (!match) {
		return false;
	}

	const [, yearPart, monthPart, dayPart, hourPart, minutePart, secondPart, millisecondPart] = match;
	const year = toInteger(yearPart);
	const month = toInteger(monthPart);
	const day = toInteger(dayPart);
	const hour = toInteger(hourPart);
	const minute = toInteger(minutePart);
	const second = toInteger(secondPart);
	const millisecond = millisecondPart ? toInteger(millisecondPart) : 0;
	const date = new Date(value);

	return (
		!Number.isNaN(date.getTime()) &&
		date.getUTCFullYear() === year &&
		date.getUTCMonth() + 1 === month &&
		date.getUTCDate() === day &&
		date.getUTCHours() === hour &&
		date.getUTCMinutes() === minute &&
		date.getUTCSeconds() === second &&
		date.getUTCMilliseconds() === millisecond
	);
}

export function isIsoDate(value: string): value is IsoDate {
	return isValidUtcDate(value);
}

export function isIsoDateTime(value: string): value is IsoDateTime {
	return isValidUtcDateTime(value);
}

export function parseIsoDate(value: string, label = 'value'): IsoDate {
	if (!isIsoDate(value)) {
		throw new Error(`Invalid ISO date at "${label}": "${value}".`);
	}

	return value;
}

export function parseIsoDateTime(value: string, label = 'value'): IsoDateTime {
	if (!isIsoDateTime(value)) {
		throw new Error(`Invalid ISO date-time at "${label}": "${value}".`);
	}

	return value;
}

export function parseOptionalIsoDateTime(
	value: string | null | undefined,
	label = 'value'
): IsoDateTime | undefined {
	if (value == null) {
		return undefined;
	}

	return parseIsoDateTime(value, label);
}

export function parseIsoDateArray(values: readonly string[], label = 'value'): IsoDate[] {
	return values.map((value, index) => parseIsoDate(value, `${label}[${index}]`));
}
