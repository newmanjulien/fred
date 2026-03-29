import { cn } from '$lib/support/cn';
import {
	DASHBOARD_MENU_SURFACE_CLASS,
	DASHBOARD_MENU_PLACEMENT_CLASS,
	type DashboardMenuPlacement
} from './menu-interactions';

export type DashboardMenuState = {
	isOpen: boolean;
	triggerElement: HTMLButtonElement | null;
	panelId: string;
	menuSurfaceClass: string;
	close: () => void;
	toggle: () => void;
};

export function useDashboardMenu(
	menuId: () => string,
	placement: () => DashboardMenuPlacement = () => 'bottom-end'
): DashboardMenuState {
	const menu = $state<DashboardMenuState>({
		isOpen: false,
		triggerElement: null,
		panelId: '',
		menuSurfaceClass: '',
		close: () => {
			menu.isOpen = false;
		},
		toggle: () => {
			menu.isOpen = !menu.isOpen;
		}
	});

	$effect(() => {
		menu.panelId = `dashboard-menu-${menuId()}`;
		menu.menuSurfaceClass = cn(
			DASHBOARD_MENU_SURFACE_CLASS,
			DASHBOARD_MENU_PLACEMENT_CLASS[placement()]
		);
	});

	return menu;
}
