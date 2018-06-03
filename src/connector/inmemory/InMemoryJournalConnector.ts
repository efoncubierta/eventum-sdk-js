import { InMemoryConnector } from "./InMemoryConnector";
import { JournalConnector } from "../JournalConnector";

// import model
import { Nullable } from "../../types/Nullable";
import { Journal } from "../../model/Journal";
import { Snapshot, SnapshotInput } from "../../model/Snapshot";
import { Event, EventInput } from "../../model/Event";

// import in-memory stores
import { InMemoryEventStore } from "./InMemoryEventStore";
import { InMemorySnapshotStore } from "./InMemorySnapshotStore";

/**
 * In-memory Journal connector for testing purposes.
 */
export class InMemoryJournalConnector extends InMemoryConnector implements JournalConnector {
  public saveSnapshot(snapshot: SnapshotInput): Promise<void> {
    InMemorySnapshotStore.putSnapshot(snapshot);
    return Promise.resolve();
  }

  public getJournal(aggregateId: any): Promise<Nullable<Journal>> {
    const snapshot = InMemorySnapshotStore.getLatestSnapshot(aggregateId);
    const events = InMemoryEventStore.getEvents(aggregateId, snapshot ? snapshot.sequence + 1 : 1);

    // if there is an snapshot or at least one event, return a valid Journal
    if (snapshot || events.length > 0) {
      return Promise.resolve({
        aggregateId,
        snapshot,
        events
      });
    }

    return Promise.resolve(null);
  }

  public saveEvents(eventInputs: EventInput[]): Promise<Event[]> {
    // Map EventInput[] -> Event[]
    const events: Event[] = eventInputs.map((eventInput) => {
      // get last sequence
      const lastSequence = InMemoryEventStore.getEvents(eventInput.aggregateId).reduce((last, current) => {
        return current.aggregateId === eventInput.aggregateId && last < current.sequence ? current.sequence : last;
      }, 0);

      return {
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
