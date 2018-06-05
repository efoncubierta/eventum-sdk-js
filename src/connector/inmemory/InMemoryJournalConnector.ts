// External dependencies
import { Option, some, none } from "fp-ts/lib/Option";
import * as UUID from "uuid";

// Eventum models
import { Journal } from "../../model/Journal";
import { Snapshot, SnapshotInput } from "../../model/Snapshot";
import { Event, EventInput } from "../../model/Event";

// Eventum connectors
import { InMemoryConnector } from "./InMemoryConnector";
import { JournalConnector } from "../JournalConnector";

// Eventum in-memory stores
import { InMemoryEventStore } from "./InMemoryEventStore";
import { InMemorySnapshotStore } from "./InMemorySnapshotStore";
import { AggregateId } from "../../model/Common";

/**
 * In-memory Journal connector for testing purposes.
 */
export class InMemoryJournalConnector extends InMemoryConnector implements JournalConnector {
  public saveSnapshot(snapshotInput: SnapshotInput): Promise<void> {
    const snapshot: Snapshot = {
      snapshotId: UUID.v4(),
      ...snapshotInput
    };

    InMemorySnapshotStore.putSnapshot(snapshot);
    return Promise.resolve();
  }

  public getJournal(aggregateId: AggregateId): Promise<Option<Journal>> {
    const snapshotOpt = InMemorySnapshotStore.getLatestSnapshot(aggregateId);
    const fromSequence = snapshotOpt.foldL(() => 1, (s) => s.sequence + 1);
    const events = InMemoryEventStore.getEvents(aggregateId, fromSequence);

    // if there is an snapshot or at least one event, return a valid Journal
    if (snapshotOpt.isSome() || events.length > 0) {
      const snapshot = snapshotOpt.fold(undefined, (s) => s);

      const journal: Journal = {
        aggregateId,
        snapshot,
        events
      };

      return Promise.resolve(some(journal));
    } else {
      return Promise.resolve(none);
    }
  }

  public saveEvents(eventInputs: EventInput[]): Promise<Event[]> {
    // Map EventInput[] -> Event[]
    const events: Event[] = eventInputs.map((eventInput) => {
      // get last sequence
      const lastSequence = InMemoryEventStore.getEvents(eventInput.aggregateId).reduce((last, current) => {
        return current.aggregateId === eventInput.aggregateId && last < current.sequence ? current.sequence : last;
      }, 0);

      return {
        eventId: UUID.v4(),
        occurredAt: new Date().toISOString(),
        sequence: lastSequence + 1,
        ...eventInput
      };
    });

    // save events in memory
    events.forEach((event) => {
      InMemoryEventStore.putEvent(event);
    });

    return Promise.resolve(events);
  }
}
