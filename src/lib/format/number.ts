const USD_INTEGER_FORMATTER = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

export function formatUsdAmount(value: number): string {
	return USD_INTEGER_FORMATTER.format(value);
}
