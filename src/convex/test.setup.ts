/// <reference types="vite/client" />

export const convexTestModules = import.meta.glob([
	'./assets.ts',
	'./accountDetail.ts',
	'./askForUpdateInternal.ts',
	'./industryInternal.ts',
	'./migrations.ts',
	'./mutations.ts',
	'./myAccounts.ts',
	'./newBusiness.ts',
	'./opportunities.ts',
	'./renewals.ts',
	'./shell.ts',
	'./sinceLastMeeting.ts',
	'./_generated/*.js',
	'!./test.setup.ts',
	'!./readModels.ts',
	'!./schema.ts',
	'!./validators.ts'
]);
