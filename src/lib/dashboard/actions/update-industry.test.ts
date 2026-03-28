import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	action: vi.fn()
}));

vi.mock('$lib/server/convex', () => ({
	api: {
		mutations: {
			updateDealIndustry: 'updateDealIndustry'
		}
	},
	createServerConvexClient: () => ({
		action: mocks.action
	})
}));

import { applyDealIndustryUpdate } from './update-industry';

const dealKey = 'deal-doc-3m';

describe('applyDealIndustryUpdate', () => {
	beforeEach(() => {
		mocks.action.mockReset();
	});

	it('updates the industry and redirects to the canonical detail route', async () => {
		mocks.action.mockResolvedValue('updated');

		await expect(
			applyDealIndustryUpdate({
				request: new Request(
					`http://localhost/my-deals/detail/${dealKey}?/updateIndustry&tab=activity`,
					{
						method: 'POST',
						body: new URLSearchParams({ dealKey, industry: 'Hospitality' })
					}
				),
				url: new URL(`http://localhost/my-deals/detail/${dealKey}?/updateIndustry&tab=activity`)
			})
		).rejects.toMatchObject({
			status: 303,
			location: `/my-deals/detail/${dealKey}?tab=activity`
		});

		expect(mocks.action).toHaveBeenCalledWith('updateDealIndustry', {
			dealKey,
			industry: 'Hospitality'
		});
	});

	it('rejects invalid input without calling Convex', async () => {
		await expect(
			applyDealIndustryUpdate({
				request: new Request(`http://localhost/my-deals/detail/${dealKey}?/updateIndustry`, {
					method: 'POST',
					body: new URLSearchParams({ dealKey, industry: 'NotReal' })
				}),
				url: new URL(`http://localhost/my-deals/detail/${dealKey}`)
			})
		).rejects.toMatchObject({
			status: 400
		});

		expect(mocks.action).not.toHaveBeenCalled();
	});
});
