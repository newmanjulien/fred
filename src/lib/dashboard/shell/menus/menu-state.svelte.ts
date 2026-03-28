import { cn } from '$lib/support/cn';
import {
	DASHBOARD_MENU_PANEL_CLASS,
	DASHBOARD_MENU_PLACEMENT_CLASS,
	type DashboardMenuPlacement
} from './menu-interactions';

export type DashboardMenuState = {
	isOpen: boolean;
	triggerElement: HTMLButtonElement | null;
	panelId: string;
	menuPanelClass: string;
	close: () => void;
	toggle: () => void;
};

export function useDashboardMenu(
	menuId: () => string,
	placement: () => DashboardMenuPlacement = () => 'bottom-end'
): DashboardMenuState {
	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);
	const panelId = $derived(`dashboard-menu-${menuId()}`);
	const menuPanelClass = $derived(
		cn(DASHBOARD_MENU_PANEL_CLASS, DASHBOARD_MENU_PLACEMENT_CLASS[placement()])
	);

	return {
		get isOpen() {
			return isOpen;
		},
		set isOpen(value) {
			isOpen = value;
		},
		get triggerElement() {
			return triggerElement;
		},
		set triggerElement(value) {
			triggerElement = value;
		},
		get panelId() {
			return panelId;
		},
		get menuPanelClass() {
			return menuPanelClass;
		},
		close() {
			isOpen = false;
		},
		toggle() {
			isOpen = !isOpen;
		}
	};
}
