import { type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { loadRenewalsDetailPageData } from '$lib/dashboard/loaders/renewalsDetail';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	return loadRenewalsDetailPageData(await parent());
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
