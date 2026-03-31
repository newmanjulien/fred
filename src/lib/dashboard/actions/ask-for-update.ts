import { error, redirect } from '@sveltejs/kit';
import { makeFunctionReference, type FunctionReference } from 'convex/server';
import { resolveDefaultBrokerKey } from '$lib/server/brokers';
import { createServerConvexClient } from '$lib/server/convex';
import { parseAccountKey, type AccountKey, type BrokerKey } from '$lib/types/keys';

type AskForAccountUpdateResult = {
	createdCount: number;
};

const askForAccountUpdateReference = makeFunctionReference<
	'action',
	{ accountKeys: string[]; actorBrokerKey: string },
	AskForAccountUpdateResult
>('mutations:askForAccountUpdate') as unknown as FunctionReference<
	'action',
	'public',
	{ accountKeys: AccountKey[]; actorBrokerKey: BrokerKey },
	AskForAccountUpdateResult
>;

function resolvePostActionRedirectUrl(url: URL) {
	const redirectUrl = new URL(url);

	for (const key of [...redirectUrl.searchParams.keys()]) {
		if (key.startsWith('/')) {
			redirectUrl.searchParams.delete(key);
		}
	}

	return `${redirectUrl.pathname}${redirectUrl.search}`;
}

function parseSelectedAccountKeys(formData: FormData) {
	const accountKeys = formData
		.getAll('accountKey')
		.map((value) => parseAccountKey(value))
		.filter((value): value is AccountKey => value !== null);

	return [...new Set(accountKeys)];
}

export async function applyAskForUpdate(params: {
	request: Request;
	url: URL;
}) {
	const formData = await params.request.formData();
	const accountKeys = parseSelectedAccountKeys(formData);

	if (accountKeys.length === 0) {
		throw error(400, 'Select at least one account.');
	}

	const result = await createServerConvexClient().action(askForAccountUpdateReference, {
		accountKeys,
		actorBrokerKey: resolveDefaultBrokerKey()
	});

	if (result.createdCount === 0) {
		throw error(404, 'Not found');
	}

	throw redirect(303, resolvePostActionRedirectUrl(params.url));
}
