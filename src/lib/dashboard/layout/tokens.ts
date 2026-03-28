export const DASHBOARD_LAYOUT_MAX_WIDTH = {
	normal: '48rem',
	wide: '88rem'
} as const;

export type DashboardLayoutWidth = keyof typeof DASHBOARD_LAYOUT_MAX_WIDTH;

export const DASHBOARD_DETAIL_RAIL_WIDTH = {
	standard: '22rem'
} as const;

export type DashboardDetailRailWidth = keyof typeof DASHBOARD_DETAIL_RAIL_WIDTH;

export function getDashboardLayoutMaxWidth(width: DashboardLayoutWidth) {
	return DASHBOARD_LAYOUT_MAX_WIDTH[width];
}

export function getDashboardDetailRailWidth(width: DashboardDetailRailWidth) {
	return DASHBOARD_DETAIL_RAIL_WIDTH[width];
}
