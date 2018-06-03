// models
import { Nullable } from "../types/Nullable";
import { Event, EventInput } from "../model/Event";
import { Journal } from "../model/Journal";
import { SnapshotPayload, SnapshotInput } from "../model/Snapshot";

/**
 * A journal connector integrates with Eventum to manage journal data.
 */
export interface JournalConnector {
  /**
   * Save a snapshot.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   * @param payload Payload
   */
  saveSnapshot(snapshot: SnapshotInput): Promise<void>;

  /**
   * Get an aggregate's journal.
   *
   * @param aggregateId Aggregate ID
   */
  getJournal(aggregateId: string): Promise<Nullable<Journal>>;

  /**
   * Save events.
   *
   * @param events Event inputs
   */
  saveEvents(events: EventInput[]): Promise<Event[]>;
}
