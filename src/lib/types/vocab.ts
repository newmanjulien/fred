export const ACTIVITY_LEVELS = ['high', 'medium', 'low'] as const;

export const DEAL_STAGES = [
	'Discovery',
	'Proposal',
	'Negotiation',
	'Closed won',
	'Closed lost'
] as const;

export const DEAL_INDUSTRIES = [
	'Industrials',
	'Transportation & logistics',
	'Hospitality',
	'Consumer goods',
	'Food & beverage'
] as const;

export const DEAL_BROKER_RELATIONSHIPS = ['owner', 'member'] as const;

export const DEAL_ACTIVITY_STREAMS = ['deal-detail', 'meeting-update'] as const;

export const DEAL_NEWS_SOURCES = ['news', 'linkedin'] as const;

export const DEAL_INSIGHT_KINDS = ['opportunity', 'risk'] as const;

export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
export type DealStage = (typeof DEAL_STAGES)[number];
export type DealIndustry = (typeof DEAL_INDUSTRIES)[number];
export type DealBrokerRelationship = (typeof DEAL_BROKER_RELATIONSHIPS)[number];
export type DealActivityStream = (typeof DEAL_ACTIVITY_STREAMS)[number];
export type DealNewsSource = (typeof DEAL_NEWS_SOURCES)[number];
export type DealInsightKind = (typeof DEAL_INSIGHT_KINDS)[number];
