import type { IsoDate } from '$lib/types/dates';
import type { PersonSummaryLike } from './person';

export type TimelineMarkerRecord<BrokerRef extends string = string> =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'broker-avatar';
			brokerRef: BrokerRef;
	  };

export type AccountActivityRecordLike<BrokerRef extends string = string> =
	| {
			kind: 'headline';
			id: string;
			occurredOnIso: IsoDate;
			body: string;
			marker: TimelineMarkerRecord<BrokerRef>;
			title: string;
	  }
	| {
			kind: 'actor-action';
			id: string;
			occurredOnIso: IsoDate;
			body: string;
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
	occurredOnIso: IsoDate;
	body: string;
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
