import type { IsoDateTime } from '$lib/types/dates';
import type { PersonSummaryLike } from './person';

export type TimelineMarkerRecord<BrokerRef extends string = string> =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'broker-avatar';
			brokerRef: BrokerRef;
	  };

export type AccountActivityEventKind = 'ask-for-update';
export type AccountUpdateRequestStatus = 'waiting' | 'provided';
export type TimelinePresentation = 'standard' | 'callout';

type AccountActivityRecordBase<BrokerRef extends string> = {
	id: string;
	occurredAtIso: IsoDateTime;
	marker: TimelineMarkerRecord<BrokerRef>;
};

export type AccountActivityRecordLike<BrokerRef extends string = string> =
	| (AccountActivityRecordBase<BrokerRef> & {
			kind: 'headline';
			body: string;
			title: string;
	  })
	| (AccountActivityRecordBase<BrokerRef> & {
			kind: 'actor-action';
			body: string;
			actorBrokerRef: BrokerRef;
			action: string;
	  })
	| (AccountActivityRecordBase<BrokerRef> & {
			kind: 'ask-for-update';
			actorBrokerRef: BrokerRef;
			status: AccountUpdateRequestStatus;
	  });

export type TimelineMarker<TPerson extends PersonSummaryLike = PersonSummaryLike> =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'avatar';
			person: TPerson;
	  };

type TimelineItemBase<TPerson extends PersonSummaryLike> = {
	id: string;
	occurredAtIso: IsoDateTime;
	presentation: TimelinePresentation;
	marker: TimelineMarker<TPerson>;
};

export type TimelineItem<TPerson extends PersonSummaryLike = PersonSummaryLike> =
	| (TimelineItemBase<TPerson> & {
			kind: 'headline';
			body: string;
			title: string;
	  })
	| (TimelineItemBase<TPerson> & {
			kind: 'actor-action';
			body: string;
			actor: TPerson;
			action: string;
	  })
	| (TimelineItemBase<TPerson> & {
			kind: 'ask-for-update';
			actor: TPerson;
			status: AccountUpdateRequestStatus;
	  });
