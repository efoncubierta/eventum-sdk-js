import { Snapshot } from "./Snapshot";
import { Event } from "./Event";
import { AggregateId } from "./Common";

/**
 * A journal is the current state of an aggregate in the event store. It is composed by
 * an snapshot, if there is one, and a set of events. Any aggregate can be rehydrated to its
 * current state by aggregating the snapshot and events within a journal.
 */
export interface Journal {
  readonly aggregateId: AggregateId;
  readonly snapshot?: Snapshot;
  readonly events: Event[];
}

export type JournalKey = Pick<Event, "aggregateId">;
