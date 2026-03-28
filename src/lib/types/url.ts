export type AbsoluteUrl = `http://${string}` | `https://${string}`;

export function parseAbsoluteUrl(value: string): AbsoluteUrl | null {
	try {
		const url = new URL(value);

		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return null;
		}

		return url.toString() as AbsoluteUrl;
	} catch {
		return null;
	}
}
