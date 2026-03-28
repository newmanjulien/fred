/// <reference types="vite/client" />

export const convexTestModules = import.meta.glob([
	'./accountDetail.ts',
	'./industryInternal.ts',
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
