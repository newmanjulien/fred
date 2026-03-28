import type { AbsoluteUrl } from '$lib/types/url';
import type { MyDealsDetailPath } from '$lib/dashboard/routing/my-deals';
import type { OpportunitiesDetailPath } from '$lib/dashboard/routing/opportunities';

export type MyDealsLink = {
	kind: 'my-deals';
	href: MyDealsDetailPath;
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

export type LinkTarget = MyDealsLink | OpportunitiesLink | ExternalLink | { kind: 'none' };
