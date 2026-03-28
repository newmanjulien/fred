import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONVEX_UNAVAILABLE_ERROR_CODE } from '$lib/convex/errors';

const mocks = vi.hoisted(() => ({
	env: { PUBLIC_CONVEX_URL: undefined as string | undefined },
	clientUrl: undefined as string | undefined,
	fetch: undefined as typeof fetch | undefined,
	query: vi.fn(),
	mutation: vi.fn(),
	action: vi.fn(),
	consoleError: vi.fn()
}));

vi.mock('$env/dynamic/public', () => ({
	env: mocks.env
}));

vi.mock('convex/browser', () => ({
	ConvexHttpClient: class MockConvexHttpClient {
		query = mocks.query;
		mutation = mocks.mutation;
		action = mocks.action;

		constructor(url: string, options?: { fetch?: typeof fetch }) {
			mocks.clientUrl = url;
			mocks.fetch = options?.fetch;
		}
	}
}));

import {
	CONVEX_INVALID_URL_MESSAGE,
	CONVEX_MISSING_URL_MESSAGE,
	CONVEX_UNAVAILABLE_MESSAGE,
	createServerConvexClient,
	resolveServerConvexUrl
} from './convex';

function expectHttpError(
	caught: unknown,
	status: number,
	message: string
): asserts caught is { status: number; body: { message: string } } {
	expect(caught).toMatchObject({
		status,
		body: {
			message
		}
	});
}

describe('server Convex client', () => {
	beforeEach(() => {
		mocks.env.PUBLIC_CONVEX_URL = undefined;
		mocks.clientUrl = undefined;
		mocks.fetch = undefined;
		mocks.query.mockReset();
		mocks.mutation.mockReset();
		mocks.action.mockReset();
		mocks.consoleError.mockReset();

		vi.spyOn(console, 'error').mockImplementation(mocks.consoleError);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('requires a valid PUBLIC_CONVEX_URL', () => {
		try {
			resolveServerConvexUrl();
			throw new Error('Expected resolveServerConvexUrl to throw.');
		} catch (caught) {
			expectHttpError(caught, 503, CONVEX_MISSING_URL_MESSAGE);
		}

		try {
			resolveServerConvexUrl({ PUBLIC_CONVEX_URL: 'not-a-url' });
			throw new Error('Expected resolveServerConvexUrl to throw.');
		} catch (caught) {
			expectHttpError(caught, 503, CONVEX_INVALID_URL_MESSAGE);
		}
	});

	it('maps backend fetch failures to service unavailable errors', async () => {
		mocks.env.PUBLIC_CONVEX_URL = 'http://127.0.0.1:3210';
		mocks.query.mockRejectedValue(new TypeError('fetch failed'));

		const client = createServerConvexClient();

		await expect(client.query('ignored' as never)).rejects.toMatchObject({
			status: 503,
			body: {
				message: CONVEX_UNAVAILABLE_MESSAGE,
				code: CONVEX_UNAVAILABLE_ERROR_CODE
			}
		});
		expect(mocks.consoleError).toHaveBeenCalled();
	});

	it('rethrows unexpected Convex errors unchanged', async () => {
		mocks.env.PUBLIC_CONVEX_URL = 'http://127.0.0.1:3210';

		const failure = new Error('unexpected query failure');
		mocks.query.mockRejectedValue(failure);

		const client = createServerConvexClient();

		await expect(client.query('ignored' as never)).rejects.toBe(failure);
	});
});
