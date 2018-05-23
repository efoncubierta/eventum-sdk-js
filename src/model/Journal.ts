import { Snapshot } from "./Snapshot";
import { Event } from "./Event";

/**
 * A journal is the current state of an aggregate in the event store. It is composed by
 * an snapshot, if there is one, and a set of events. Any aggregate can be rehydrated to its
 * current state by aggregating the snapshot and events within a journal.
 */
export class Journal {
  public readonly aggregateId: string;
  public readonly snapshot?: Snapshot<any>;
  public readonly events: Array<Event<any>>;
}
