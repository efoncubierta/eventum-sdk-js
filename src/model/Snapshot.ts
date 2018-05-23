import { Message } from "./Message";

/**
 * A snapshot is used to improve performance when rehydrating an aggregate from events. Instead
 * of aggregating all the events ever emited for an aggregate, snapshots can be created from a certain event
 * and resume the rehydration process from it.
 */
export class Snapshot<P> extends Message {
  public static readonly MESSAGE_TYPE = "Snapshot";

  public readonly aggregateId: string;
  public readonly sequence: number;
  public readonly payload: P;

  /**
   * Constructor.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Sequence number of the last event when snapshot was taken
   * @param payload Payload
   */
  constructor(aggregateId: string, sequence: number, payload: P) {
    super(Snapshot.MESSAGE_TYPE);
    this.aggregateId = aggregateId;
    this.sequence = sequence;
    this.payload = payload;
  }
}
