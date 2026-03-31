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

export type AccountActivityRecordLike<BrokerRef extends string = string> =
	| {
			kind: 'headline';
			id: string;
			occurredAtIso: IsoDateTime;
			body: string;
			eventKind?: AccountActivityEventKind;
			updateRequestStatus?: AccountUpdateRequestStatus;
			marker: TimelineMarkerRecord<BrokerRef>;
			title: string;
	  }
	| {
			kind: 'actor-action';
			id: string;
			occurredAtIso: IsoDateTime;
			body: string;
			eventKind?: AccountActivityEventKind;
			updateRequestStatus?: AccountUpdateRequestStatus;
			marker: TimelineMarkerRecord<BrokerRef>;
			actorBrokerRef: BrokerRef;
			action: string;
	  };

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
	body: string;
	updateRequestStatus?: AccountUpdateRequestStatus;
	presentation: TimelinePresentation;
	marker: TimelineMarker<TPerson>;
};

export type TimelineItem<TPerson extends PersonSummaryLike = PersonSummaryLike> =
	| (TimelineItemBase<TPerson> & {
			kind: 'headline';
			title: string;
	  })
	| (TimelineItemBase<TPerson> & {
			kind: 'actor-action';
			actor: TPerson;
			action: string;
	  });
