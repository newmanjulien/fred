import type { AbsoluteUrl } from '$lib/types/url';
import type { MyAccountsDetailPath } from '$lib/dashboard/routing/my-accounts';
import type { NewBusinessDetailPath } from '$lib/dashboard/routing/new-business';
import type { OpportunitiesDetailPath } from '$lib/dashboard/routing/opportunities';
import type { RenewalsDetailPath } from '$lib/dashboard/routing/renewals';
import type { SinceLastMeetingDetailPath } from '$lib/dashboard/routing/since-last-meeting';

export type MyAccountsLink = {
	kind: 'my-accounts';
	href: MyAccountsDetailPath;
};

export type NewBusinessLink = {
	kind: 'new-business';
	href: NewBusinessDetailPath;
};

export type RenewalsLink = {
	kind: 'renewals';
	href: RenewalsDetailPath;
};

export type SinceLastMeetingLink = {
	kind: 'since-last-meeting';
	href: SinceLastMeetingDetailPath;
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

export type NoLink = { kind: 'none' };

export type DashboardInternalLinkTarget =
	| MyAccountsLink
	| NewBusinessLink
	| RenewalsLink
	| SinceLastMeetingLink
	| OpportunitiesLink;

export type DashboardLinkTarget = DashboardInternalLinkTarget | ExternalLink | NoLink;
export type LinkTarget = DashboardLinkTarget;

export function isInternalDashboardLink(
	link: DashboardLinkTarget
): link is DashboardInternalLinkTarget {
	return link.kind !== 'external' && link.kind !== 'none';
}

export function isExternalDashboardLink(link: DashboardLinkTarget): link is ExternalLink {
	return link.kind === 'external';
}
