import { Message } from "./Message";

/**
 * An event represents a side effect in the system. It indicates that something has changed.
 * Events are emited by aggregates and sagas.
 *
 * Events are grouped by aggregate and sorted by sequence.
 */
export class Event<P> extends Message {
  public static readonly MESSAGE_TYPE = "Event";

  public readonly eventType: string;
  public readonly occurredAt: string;
  public readonly aggregateId: string;
  public readonly sequence: number;
  public readonly payload: P;

  /**
   * Constructor.
   *
   * @param eventType Event type. Used to classify events by type
   * @param occurredAt Date and time the event occurred at (ISO8601 format)
   * @param aggregateId Aggregate ID the event relates to
   * @param sequence Sequence number that provides order among events
   * @param payload Payload
   */
  constructor(eventType: string, occurredAt: string, aggregateId: string, sequence: number, payload?: P) {
    super(Event.MESSAGE_TYPE);
    this.eventType = eventType;
    this.occurredAt = occurredAt;
    this.aggregateId = aggregateId;
    this.sequence = sequence;
    this.payload = payload;
  }
}
