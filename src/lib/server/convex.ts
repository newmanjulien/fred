import { error, isHttpError } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import type {
	FunctionReference,
	FunctionReturnType,
	OptionalRestArgs
} from 'convex/server';
import { env as publicEnv } from '$env/dynamic/public';
import { CONVEX_UNAVAILABLE_ERROR_CODE } from '$lib/convex/errors';
import { api } from '../../convex/_generated/api';

export { api };

type PublicQuery = FunctionReference<'query', 'public'>;
type PublicMutation = FunctionReference<'mutation', 'public'>;
type PublicAction = FunctionReference<'action', 'public'>;

type ServerConvexEnv = {
	PUBLIC_CONVEX_URL?: string;
};

type FetchImplementation = typeof fetch;

const NETWORK_ERROR_CODES = new Set([
	'ECONNREFUSED',
	'ECONNRESET',
	'EHOSTUNREACH',
	'ENETUNREACH',
	'ENOTFOUND',
	'ETIMEDOUT'
]);

const CONVEX_UDF_FAILED_STATUS = 560;
const CONVEX_UNAVAILABLE_MESSAGE_PATTERNS = [
	/Could not find public function/u,
	/Did you forget to run/u
];

export const CONVEX_URL_ENV_VAR = 'PUBLIC_CONVEX_URL';
export const CONVEX_UNAVAILABLE_STATUS = 503;
export const CONVEX_MISSING_URL_MESSAGE =
	`Convex backend is not configured. Set ${CONVEX_URL_ENV_VAR} in the server environment.`;
export const CONVEX_INVALID_URL_MESSAGE =
	`Convex backend is misconfigured. ${CONVEX_URL_ENV_VAR} must be an absolute URL.`;
export const CONVEX_UNAVAILABLE_MESSAGE =
	`Convex backend is unavailable. Run \`npm run dev\` locally or verify ${CONVEX_URL_ENV_VAR} in the server environment.`;

class ConvexAvailabilityError extends Error {
	override name = 'ConvexAvailabilityError';

	constructor(
		message: string,
		readonly cause?: unknown
	) {
		super(message);
	}
}

function throwConvexServiceUnavailable(message: string, cause?: unknown): never {
	console.error(`[convex] ${message}`, cause);
	throw error(CONVEX_UNAVAILABLE_STATUS, {
		message,
		code: CONVEX_UNAVAILABLE_ERROR_CODE
	});
}

function getNetworkErrorCode(cause: unknown): string | null {
	if (!cause || typeof cause !== 'object') {
		return null;
	}

	if ('code' in cause && typeof cause.code === 'string') {
		return cause.code;
	}

	if ('cause' in cause) {
		return getNetworkErrorCode(cause.cause);
	}

	return null;
}

function isConvexAvailabilityMessage(message: string) {
	return CONVEX_UNAVAILABLE_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
}

export function isConvexBackendUnavailableError(cause: unknown) {
	if (cause instanceof ConvexAvailabilityError) {
		return true;
	}

	if (cause instanceof TypeError && cause.message === 'fetch failed') {
		return true;
	}

	if (cause instanceof Error && isConvexAvailabilityMessage(cause.message)) {
		return true;
	}

	const networkErrorCode = getNetworkErrorCode(cause);
	return networkErrorCode !== null && NETWORK_ERROR_CODES.has(networkErrorCode);
}

export function createConvexFetch(baseFetch: FetchImplementation = fetch): FetchImplementation {
	return (async (input: RequestInfo | URL, init?: RequestInit) => {
		try {
			const response = await baseFetch(input, init);

			if (!response.ok && response.status !== CONVEX_UDF_FAILED_STATUS) {
				throw new ConvexAvailabilityError(CONVEX_UNAVAILABLE_MESSAGE, {
					body: await response.clone().text(),
					status: response.status,
					statusText: response.statusText,
					url: response.url
				});
			}

			return response;
		} catch (cause) {
			if (cause instanceof ConvexAvailabilityError) {
				throw cause;
			}

			if (isConvexBackendUnavailableError(cause)) {
				throw new ConvexAvailabilityError(CONVEX_UNAVAILABLE_MESSAGE, cause);
			}

			throw cause;
		}
	}) as FetchImplementation;
}

export function resolveServerConvexUrl(env: ServerConvexEnv = publicEnv) {
	const deploymentUrl = env.PUBLIC_CONVEX_URL?.trim();

	if (!deploymentUrl) {
		throw error(CONVEX_UNAVAILABLE_STATUS, {
			message: CONVEX_MISSING_URL_MESSAGE,
			code: CONVEX_UNAVAILABLE_ERROR_CODE
		});
	}

	try {
		new URL(deploymentUrl);
	} catch {
		throw error(CONVEX_UNAVAILABLE_STATUS, {
			message: CONVEX_INVALID_URL_MESSAGE,
			code: CONVEX_UNAVAILABLE_ERROR_CODE
		});
	}

	return deploymentUrl;
}

async function runConvexRequest<TValue>(operation: () => Promise<TValue>): Promise<TValue> {
	try {
		return await operation();
	} catch (cause) {
		if (isHttpError(cause)) {
			throw cause;
		}

		if (isConvexBackendUnavailableError(cause)) {
			throwConvexServiceUnavailable(CONVEX_UNAVAILABLE_MESSAGE, cause);
		}

		throw cause;
	}
}

export function createServerConvexClient(fetchImplementation: FetchImplementation = createConvexFetch()) {
	const client = new ConvexHttpClient(resolveServerConvexUrl(), {
		fetch: fetchImplementation,
		logger: false
	});

	return {
		query<Query extends PublicQuery>(
			query: Query,
			...args: OptionalRestArgs<Query>
		): Promise<FunctionReturnType<Query>> {
			return runConvexRequest(
				() => client.query(query, ...args) as Promise<FunctionReturnType<Query>>
			);
		},
		mutation<Mutation extends PublicMutation>(
			mutation: Mutation,
			...args: OptionalRestArgs<Mutation>
		): Promise<FunctionReturnType<Mutation>> {
			return runConvexRequest(
				() => client.mutation(mutation, ...args) as Promise<FunctionReturnType<Mutation>>
			);
		},
		action<Action extends PublicAction>(
			action: Action,
			...args: OptionalRestArgs<Action>
		): Promise<FunctionReturnType<Action>> {
			return runConvexRequest(
				() => client.action(action, ...args) as Promise<FunctionReturnType<Action>>
			);
		}
	};
}
