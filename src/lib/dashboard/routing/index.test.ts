import { describe, expect, it } from 'vitest';
import { toAccountKey, toInsightKey } from '$lib/types/keys';
import {
	DEFAULT_DASHBOARD_ROUTE_REF,
	isDashboardNavRouteActive,
	parseDashboardRouteFromLayout,
	resolveDashboardRoute
} from './index';

describe('dashboard routing', () => {
	it('parses default and non-default dashboard view routes', () => {
		expect(
			parseDashboardRouteFromLayout({
				routeId: '/(dashboard)/new-business',
				params: {},
				searchParams: new URLSearchParams()
			})
		).toEqual({
			kind: 'new-business-list',
			view: 'accounts'
		});

		expect(
			parseDashboardRouteFromLayout({
				routeId: '/(dashboard)/renewals/[view=renewalsView]',
				params: { view: 'likely-out-of-date' },
				searchParams: new URLSearchParams()
			})
		).toEqual({
			kind: 'renewals-list',
			view: 'likely-out-of-date'
		});
	});

	it('parses my accounts detail routes with tab state', () => {
		expect(
			parseDashboardRouteFromLayout({
				routeId: '/(dashboard)/my-accounts/detail/[accountKey]',
				params: { accountKey: 'acct-1' },
				searchParams: new URLSearchParams()
			})
		).toEqual({
			kind: 'my-accounts-detail',
			accountKey: 'acct-1',
			view: 'news',
			tab: 'news'
		});

		expect(
			parseDashboardRouteFromLayout({
				routeId: '/(dashboard)/my-accounts/[view=myAccountsView]/detail/[accountKey]',
				params: { view: 'accounts', accountKey: 'acct-1' },
				searchParams: new URLSearchParams([['tab', 'activity']])
			})
		).toEqual({
			kind: 'my-accounts-detail',
			accountKey: 'acct-1',
			view: 'accounts',
			tab: 'activity'
		});
	});

	it('rejects invalid search params and invalid non-default views', () => {
		expect(
			parseDashboardRouteFromLayout({
				routeId: '/(dashboard)/new-business',
				params: {},
				searchParams: new URLSearchParams([['meetingKey', 'meeting-1']])
			})
		).toBeNull();

		expect(
			parseDashboardRouteFromLayout({
				routeId: '/(dashboard)/renewals/[view=renewalsView]',
				params: { view: 'accounts' },
				searchParams: new URLSearchParams()
			})
		).toBeNull();
	});

	it('resolves and groups active routes consistently', () => {
		expect(resolveDashboardRoute(DEFAULT_DASHBOARD_ROUTE_REF)).toBe('/new-business');
		expect(
			isDashboardNavRouteActive(
				{ kind: 'opportunities-list', meetingKey: null },
				{
					kind: 'opportunities-detail',
					insightKey: toInsightKey('insight-1'),
					meetingKey: null
				}
			)
		).toBe(true);
		expect(
			isDashboardNavRouteActive(
				{ kind: 'renewals-list', view: 'accounts' },
				{
					kind: 'new-business-detail',
					accountKey: toAccountKey('acct-1'),
					view: 'accounts'
				}
			)
		).toBe(false);
	});
});
