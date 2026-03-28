import type { AbsoluteUrl } from '$lib/types/url';
import type { MyAccountsDetailPath } from '$lib/dashboard/routing/my-accounts';
import type { OpportunitiesDetailPath } from '$lib/dashboard/routing/opportunities';

export type MyAccountsLink = {
	kind: 'my-accounts';
	href: MyAccountsDetailPath;
};

export type OpportunitiesLink = {
	kind: 'opportunities';
	href: OpportunitiesDetailPath;
};

export type ExternalLink = {
	kind: 'external';
	href: AbsoluteUrl;
	target?: string;
	rel?: string;
};

export type LinkTarget = MyAccountsLink | OpportunitiesLink | ExternalLink | { kind: 'none' };
