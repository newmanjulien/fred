import type { ParamMatcher } from '@sveltejs/kit';
import { isNonDefaultMyDealsView } from '$lib/dashboard/routing/my-deals';

export const match = ((param: string) => isNonDefaultMyDealsView(param)) satisfies ParamMatcher;
