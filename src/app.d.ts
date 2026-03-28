import type { DashboardHeader } from '$lib/dashboard/shell/header/types';

// See https://svelte.dev/docs/kit/types#app.d.ts
	// for information about these interfaces
	declare global {
		namespace App {
			interface Error {
				message: string;
				code?: string;
			}
			// interface Locals {}
			interface PageData {
				header?: DashboardHeader;
			}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
