import { error, redirect } from '@sveltejs/kit';
import { api, createServerConvexClient } from '$lib/server/convex';
import { parseAccountKey } from '$lib/types/keys';
import { ACCOUNT_INDUSTRIES, type AccountIndustry } from '$lib/types/vocab';

function isAccountIndustry(value: string): value is AccountIndustry {
	return ACCOUNT_INDUSTRIES.includes(value as AccountIndustry);
}

function resolvePostActionRedirectUrl(url: URL) {
	const redirectUrl = new URL(url);

	for (const key of [...redirectUrl.searchParams.keys()]) {
		if (key.startsWith('/')) {
			redirectUrl.searchParams.delete(key);
		}
	}

	return `${redirectUrl.pathname}${redirectUrl.search}`;
}

export async function applyAccountIndustryUpdate(params: {
	request: Request;
	url: URL;
}) {
	const formData = await params.request.formData();
	const accountKey = parseAccountKey(formData.get('accountKey'));
	const industry = formData.get('industry');

	if (!accountKey) {
		throw error(400, 'Invalid account key.');
	}

	if (typeof industry !== 'string' || !isAccountIndustry(industry)) {
		throw error(400, 'Invalid industry selection.');
	}

	const result = await createServerConvexClient().action(api.mutations.updateAccountIndustry, {
		accountKey,
		industry
	});

	if (result === 'not-found') {
		throw error(404, 'Not found');
	}

	throw redirect(303, resolvePostActionRedirectUrl(params.url));
}
