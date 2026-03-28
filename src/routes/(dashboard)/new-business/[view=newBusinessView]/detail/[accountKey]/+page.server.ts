import { type Actions } from '@sveltejs/kit';
import { applyAccountIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { loadNewBusinessDetailPageData } from '$lib/dashboard/loaders/newBusinessDetail';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	return loadNewBusinessDetailPageData(await parent());
};

export const actions = {
	updateIndustry: ({ request, url }) => applyAccountIndustryUpdate({ request, url })
} satisfies Actions;
