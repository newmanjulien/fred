import type { IsoDate, IsoDateTime } from '$lib/types/dates';

const MONTH_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC'
});

const LONG_MONTH_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
	month: 'long',
	day: 'numeric',
	timeZone: 'UTC'
});

const LONG_MONTH_DAY_YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC'
});

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('en', {
	numeric: 'auto'
});

function getValidDate(value: string): Date | null {
	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? null : date;
}

function formatUtcIsoDate(isoDate: IsoDate, formatter: Intl.DateTimeFormat): string {
	const date = getValidDate(`${isoDate}T00:00:00Z`);

	return date ? formatter.format(date) : isoDate;
}

function getRelativeTimeValue(deltaMs: number, unitMs: number): number {
	return Math.trunc(deltaMs / unitMs);
}

function getRelativeMonthValue(earlier: Date, later: Date): number {
	let monthValue =
		(later.getUTCFullYear() - earlier.getUTCFullYear()) * 12 +
		(later.getUTCMonth() - earlier.getUTCMonth());

	if (later.getUTCDate() < earlier.getUTCDate()) {
		monthValue -= 1;
	}

	return monthValue;
}

function capitalizeFirstLetter(value: string): string {
	return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function formatIsoDate(isoDate: IsoDate): string {
	return formatUtcIsoDate(isoDate, MONTH_DAY_FORMATTER);
}

export function formatIsoDateMonthDayLong(isoDate: IsoDate): string {
	return formatUtcIsoDate(isoDate, LONG_MONTH_DAY_FORMATTER);
}

export function formatIsoDateLong(isoDate: IsoDate): string {
	return formatUtcIsoDate(isoDate, LONG_MONTH_DAY_YEAR_FORMATTER);
}

export function formatIsoDateTimeRelative(isoDateTime: IsoDateTime, now: Date = new Date()): string {
	const date = getValidDate(isoDateTime);

	if (!date) {
		return isoDateTime;
	}

	const deltaMs = date.getTime() - now.getTime();
	const absMs = Math.abs(deltaMs);
	const minuteMs = 60_000;
	const hourMs = 60 * minuteMs;
	const dayMs = 24 * hourMs;
	const weekMs = 7 * dayMs;

	if (absMs >= weekMs) {
		return capitalizeFirstLetter(
			RELATIVE_TIME_FORMATTER.format(getRelativeTimeValue(deltaMs, weekMs), 'week')
		);
	}

	if (absMs >= dayMs) {
		return capitalizeFirstLetter(
			RELATIVE_TIME_FORMATTER.format(getRelativeTimeValue(deltaMs, dayMs), 'day')
		);
	}

	if (absMs >= hourMs) {
		return capitalizeFirstLetter(
			RELATIVE_TIME_FORMATTER.format(getRelativeTimeValue(deltaMs, hourMs), 'hour')
		);
	}

	return capitalizeFirstLetter(
		RELATIVE_TIME_FORMATTER.format(getRelativeTimeValue(deltaMs, minuteMs), 'minute')
	);
}

export function formatIsoDateTimeRelativeMonths(
	isoDateTime: IsoDateTime,
	now: Date = new Date()
): string {
	const date = getValidDate(isoDateTime);

	if (!date) {
		return isoDateTime;
	}

	const deltaMs = date.getTime() - now.getTime();
	const dayMs = 24 * 60 * 60_000;

	if (Math.abs(deltaMs) < 28 * dayMs) {
		return formatIsoDateTimeRelative(isoDateTime, now);
	}

	const [earlier, later] = deltaMs < 0 ? [date, now] : [now, date];
	const monthValue = getRelativeMonthValue(earlier, later);

	if (monthValue < 1) {
		return formatIsoDateTimeRelative(isoDateTime, now);
	}

	return capitalizeFirstLetter(
		RELATIVE_TIME_FORMATTER.format(deltaMs < 0 ? -monthValue : monthValue, 'month')
	);
}
