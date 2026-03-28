export const ACTIVITY_LEVELS = ['high', 'medium', 'low'] as const;

export const ACCOUNT_STAGES = [
	'Discovery',
	'Proposal',
	'Negotiation',
	'Closed won',
	'Closed lost'
] as const;

export const ACCOUNT_INDUSTRIES = [
	'Industrials',
	'Transportation & logistics',
	'Hospitality',
	'Consumer goods',
	'Food & beverage'
] as const;

export const ACCOUNT_BROKER_RELATIONSHIPS = ['owner', 'member'] as const;

export const ACCOUNT_ACTIVITY_STREAMS = ['account-detail', 'meeting-update'] as const;

export const ACCOUNT_NEWS_SOURCES = ['news', 'linkedin'] as const;

export const ACCOUNT_INSIGHT_KINDS = ['opportunity', 'risk'] as const;

export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
export type AccountStage = (typeof ACCOUNT_STAGES)[number];
export type AccountIndustry = (typeof ACCOUNT_INDUSTRIES)[number];
export type AccountBrokerRelationship = (typeof ACCOUNT_BROKER_RELATIONSHIPS)[number];
export type AccountActivityStream = (typeof ACCOUNT_ACTIVITY_STREAMS)[number];
export type AccountNewsSource = (typeof ACCOUNT_NEWS_SOURCES)[number];
export type AccountInsightKind = (typeof ACCOUNT_INSIGHT_KINDS)[number];
