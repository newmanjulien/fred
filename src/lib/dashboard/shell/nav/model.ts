import { Activity, CircleQuestionMark, Lightbulb, List, Rss } from 'lucide-svelte';
import {
	type DashboardNavRouteRef,
	type DashboardRouteRef,
	isDashboardNavRouteActive
} from '$lib/dashboard/routing';
import { DEFAULT_NEW_BUSINESS_VIEW } from '$lib/dashboard/routing/new-business';
import { DEFAULT_MY_DEALS_VIEW } from '$lib/dashboard/routing/my-deals';

export type { DashboardNavRouteRef } from '$lib/dashboard/routing';

type DashboardNavIcon = typeof Rss;

export type DashboardNavSectionId = 'brokers' | 'managers' | 'leadership' | 'bottom';

type DashboardNavItemBase = {
	label: string;
	icon: DashboardNavIcon;
};

export type DashboardNavRouteItem = DashboardNavItemBase & {
	kind: 'route';
	route: DashboardNavRouteRef;
};

export type DashboardNavDisabledItem = DashboardNavItemBase & {
	kind: 'disabled';
};

export type DashboardNavItem = DashboardNavRouteItem | DashboardNavDisabledItem;

export type DashboardNavSection = {
	id: DashboardNavSectionId;
	heading: string | null;
	desktopSectionClass?: string;
	mobileSectionClass?: string;
	showCollapsedDivider?: boolean;
	items: readonly DashboardNavItem[];
};

function createRouteItem(params: {
	route: DashboardNavRouteRef;
	label: string;
	icon: DashboardNavIcon;
}): DashboardNavRouteItem {
	const { route, label, icon } = params;

	return {
		kind: 'route',
		route,
		label,
		icon
	};
}

export const DASHBOARD_NAV_SECTIONS: readonly DashboardNavSection[] = [
	{
		id: 'brokers',
		heading: 'For brokers',
		desktopSectionClass: 'pt-2',
		items: [
			createRouteItem({
				route: {
					kind: 'my-deals-list',
					view: DEFAULT_MY_DEALS_VIEW
				},
				label: 'My deals',
				icon: Rss
			})
		]
	},
	{
		id: 'managers',
		heading: 'For managers',
		desktopSectionClass: 'pt-6',
		mobileSectionClass: 'pt-4',
		showCollapsedDivider: true,
		items: [
			createRouteItem({
				route: {
					kind: 'since-last-meeting',
					meetingKey: null
				},
				label: 'Since last meeting',
				icon: Activity
			}),
			createRouteItem({
				route: {
					kind: 'opportunities-list',
					meetingKey: null
				},
				label: 'Opportunities and risks',
				icon: Lightbulb
			})
		]
	},
	{
		id: 'leadership',
		heading: 'For leadership',
		desktopSectionClass: 'pt-6',
		mobileSectionClass: 'pt-4',
		showCollapsedDivider: true,
		items: [
			createRouteItem({
				route: {
					kind: 'new-business-list',
					view: DEFAULT_NEW_BUSINESS_VIEW
				},
				label: 'New business',
				icon: List
			})
		]
	},
	{
		id: 'bottom',
		heading: null,
		desktopSectionClass: 'pt-3',
		mobileSectionClass: 'pt-6',
		items: [
			{
				kind: 'disabled',
				label: 'Contact support',
				icon: CircleQuestionMark
			}
		]
	}
];

export function getActiveDashboardNavRoute(currentRoute: DashboardRouteRef) {
	for (const section of DASHBOARD_NAV_SECTIONS) {
		for (const item of section.items) {
			if (item.kind === 'route' && isDashboardNavRouteActive(item.route, currentRoute)) {
				return item.route;
			}
		}
	}

	return null;
}
