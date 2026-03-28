import type { Action } from 'svelte/action';

export const DASHBOARD_MENU_PANEL_CLASS =
	'app-layer-floating absolute min-w-56 rounded-md border border-zinc-100 bg-white p-1 shadow-sm';

export const DASHBOARD_MENU_PLACEMENT_CLASS = {
	'bottom-start': 'left-0 top-full mt-1',
	'bottom-end': 'right-0 top-full mt-1',
	bottom: 'left-1/2 top-full mt-1 -translate-x-1/2'
} as const;

export type DashboardMenuPlacement = keyof typeof DASHBOARD_MENU_PLACEMENT_CLASS;

type DismissibleMenuParams = {
	open: boolean;
	close: () => void;
	trigger?: HTMLElement | null;
};

export const dismissibleMenu: Action<HTMLElement, DismissibleMenuParams> = (node, params) => {
	let current = params;

	function handleDocumentClick(event: MouseEvent) {
		const target = event.target;

		if (!current.open || !(target instanceof Node) || node.contains(target)) {
			return;
		}

		current.close();
	}

	function handleDocumentKeydown(event: KeyboardEvent) {
		if (!current.open || event.key !== 'Escape') {
			return;
		}

		event.preventDefault();
		current.close();
		current.trigger?.focus();
	}

	document.addEventListener('click', handleDocumentClick);
	document.addEventListener('keydown', handleDocumentKeydown);

	return {
		update(next) {
			current = next;
		},
		destroy() {
			document.removeEventListener('click', handleDocumentClick);
			document.removeEventListener('keydown', handleDocumentKeydown);
		}
	};
};
