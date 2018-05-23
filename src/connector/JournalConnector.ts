import { Event } from "../model/Event";
import { Journal } from "../model/Journal";

/**
 * A journal connector integrates with Eventum to manage journal data.
 */
export interface JournalConnector {
  /**
   * Create a snapshot.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence
   * @param payload Payload
   */
  createSnapshot(aggregateId: string, sequence: number, payload: any): Promise<void>;

  /**
   * Get an aggregate's journal.
   *
   * @param aggregateId Aggregate ID
   */
  getJournal(aggregateId): Promise<Journal>;

  /**
   * Save events.
   *
   * @param events Events
   */
  saveEvents(events: Array<Event<any>>): Promise<void>;
}
