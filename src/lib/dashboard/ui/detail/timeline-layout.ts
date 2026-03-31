export const TIMELINE_LAYOUT = {
	laneWidth: 24,
	columnGap: 16,
	headlineHeight: 24,
	rowSpacing: 24,
	markerShellSize: 24,
	avatarSize: 16,
	dotSize: 6,
	calloutInsetX: 16,
	calloutInsetY: 12
} as const;

export function getMarkerStyle(size: number) {
	return `width:${size}px;height:${size}px;`;
}

export function getRowStyle() {
	return `grid-template-columns:${TIMELINE_LAYOUT.laneWidth}px minmax(0,1fr);column-gap:${TIMELINE_LAYOUT.columnGap}px;`;
}
