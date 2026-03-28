import type { ParamMatcher } from '@sveltejs/kit';
import { isNonDefaultRenewalsView } from '$lib/dashboard/routing/renewals';

export const match = ((param: string) => isNonDefaultRenewalsView(param)) satisfies ParamMatcher;
