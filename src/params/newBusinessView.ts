import type { ParamMatcher } from '@sveltejs/kit';
import { isNonDefaultNewBusinessView } from '$lib/dashboard/routing/new-business';

export const match = ((param: string) => isNonDefaultNewBusinessView(param)) satisfies ParamMatcher;
