import { InMemoryConnector } from "./InMemoryConnector";
import { JournalConnector } from "../JournalConnector";

// import model
import { Event } from "../../model/Event";
import { Journal } from "../../model/Journal";
import { Snapshot } from "../../model/Snapshot";

// import in-memory stores
import { InMemoryJournalStore } from "./InMemoryJournalStore";
import { InMemorySnapshotStore } from "./InMemorySnapshotStore";

/**
 * In-memory Journal connector for testing purposes.
 */
export class InMemoryJournalConnector extends InMemoryConnector implements JournalConnector {
  public saveSnapshot(aggregateId: string, sequence: number, payload: any): Promise<void> {
    const snapshot = new Snapshot(aggregateId, sequence, payload);
    InMemorySnapshotStore.putSnapshot(snapshot);
    return Promise.resolve();
  }

  public getJournal(aggregateId: any): Promise<Journal> {
    const snapshot = InMemorySnapshotStore.getLatestSnapshot(aggregateId);
    const events = InMemoryJournalStore.getEvents(aggregateId, snapshot ? snapshot.sequence + 1 : 0);

    return Promise.resolve({
      aggregateId,
      snapshot,
      events
    });
  }

  public saveEvents(events: Array<Event<any>>): Promise<void> {
    events.forEach((event) => {
      InMemoryJournalStore.putEvent(event);
    });

    return Promise.resolve();
  }
}
