// External dependencies
import { Option } from "fp-ts/lib/Option";

// Eventum models
import { Event, EventInput } from "../model/Event";
import { Journal } from "../model/Journal";
import { SnapshotPayload, SnapshotInput } from "../model/Snapshot";
import { AggregateId } from "../model/Common";

/**
 * A journal connector integrates with Eventum to manage journal data.
 */
export interface JournalConnector {
  /**
   * Save a snapshot.
   *
   * @param snapshotInput Snapshot input
   */
  saveSnapshot(snapshotInput: SnapshotInput): Promise<void>;

  /**
   * Get an aggregate's journal.
   *
   * @param aggregateId Aggregate ID
   */
  getJournal(aggregateId: AggregateId): Promise<Option<Journal>>;

  /**
   * Save events.
   *
   * @param eventInputs Event inputs
   */
  saveEvents(eventInputs: EventInput[]): Promise<Event[]>;
}
