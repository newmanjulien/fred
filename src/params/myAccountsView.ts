import type { ParamMatcher } from '@sveltejs/kit';
import { isNonDefaultMyAccountsView } from '$lib/dashboard/routing/my-accounts';

export const match = ((param: string) => isNonDefaultMyAccountsView(param)) satisfies ParamMatcher;
