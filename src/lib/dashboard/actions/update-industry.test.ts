import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	action: vi.fn()
}));

vi.mock('$lib/server/convex', () => ({
	api: {
		mutations: {
			updateAccountIndustry: 'updateAccountIndustry'
		}
	},
	createServerConvexClient: () => ({
		action: mocks.action
	})
}));

import { applyAccountIndustryUpdate } from './update-industry';

const accountKey = 'account-doc-3m';

describe('applyAccountIndustryUpdate', () => {
	beforeEach(() => {
		mocks.action.mockReset();
	});

	it('updates the industry and redirects to the canonical detail route', async () => {
		mocks.action.mockResolvedValue('updated');

		await expect(
			applyAccountIndustryUpdate({
				request: new Request(
					`http://localhost/my-accounts/detail/${accountKey}?/updateIndustry&tab=activity`,
					{
						method: 'POST',
						body: new URLSearchParams({ accountKey, industry: 'Hospitality' })
					}
				),
				url: new URL(`http://localhost/my-accounts/detail/${accountKey}?/updateIndustry&tab=activity`)
			})
		).rejects.toMatchObject({
			status: 303,
			location: `/my-accounts/detail/${accountKey}?tab=activity`
		});

		expect(mocks.action).toHaveBeenCalledWith('updateAccountIndustry', {
			accountKey,
			industry: 'Hospitality'
		});
	});

	it('rejects invalid input without calling Convex', async () => {
		await expect(
			applyAccountIndustryUpdate({
				request: new Request(`http://localhost/my-accounts/detail/${accountKey}?/updateIndustry`, {
					method: 'POST',
					body: new URLSearchParams({ accountKey, industry: 'NotReal' })
				}),
				url: new URL(`http://localhost/my-accounts/detail/${accountKey}`)
			})
		).rejects.toMatchObject({
			status: 400
		});

		expect(mocks.action).not.toHaveBeenCalled();
	});
});
