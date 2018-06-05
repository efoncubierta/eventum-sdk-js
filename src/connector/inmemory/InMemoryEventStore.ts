// External dependencies
import { Option, none, some } from "fp-ts/lib/Option";

// Eventum models
import { Event, EventKey } from "../../model/Event";
import { AggregateId, Sequence } from "../../model/Common";

/**
 * Manage journal data in memory.
 */
export class InMemoryEventStore {
  private static events: Event[] = [];

  /**
   * Put an event in the in-memory journals array. This action replaces any existing
   * event for the same aggregate ID and sequence number.
   *
   * @param event Event
   */
  public static putEvent(event: Event): void {
    this.deleteEvent({
      aggregateId: event.aggregateId,
      sequence: event.sequence
    });
    this.events.push(event);
  }

  /**
   * Delete an event from the in-memory journals array.
   *
   * @param eventKey Event Key
   */
  public static deleteEvent(eventKey: EventKey): void {
    this.events = this.events.filter((e) => {
      return !(e.aggregateId === eventKey.aggregateId && e.sequence === eventKey.sequence);
    });
  }

  /**
   * Get an event from the in-memory journals array.
   *
   * @param eventKey Event key
   *
   * @return Event object or null if it doesn't exist
   */
  public static getEvent(eventKey: EventKey): Option<Event> {
    const e = this.events.find((event) => {
      return event.aggregateId === eventKey.aggregateId && event.sequence === eventKey.sequence;
    });

    return e ? some(e) : none;
  }

  /**
   * Get a range of sorted events (lower sequence first).
   *
   * @param aggregateId Aggregate ID
   * @param fromSequence From sequence
   * @param toSequence To sequence
   * @param limit Limit the number of results
   * @param reverse Reverse the order of events (higher sequence first)
   * @returns Sequence of events sorted in ascending order by sequence or empty array if none are found
   */
  public static getEvents(
    aggregateId: AggregateId,
    fromSequence: Sequence = 0,
    toSequence: Sequence = Number.MAX_SAFE_INTEGER,
    limit: number = Number.MAX_SAFE_INTEGER,
    reverse: boolean = false
  ): Event[] {
    const events = this.events
      .filter((event) => {
        return event.aggregateId === aggregateId && event.sequence >= fromSequence && event.sequence <= toSequence;
      })
      .sort((last, current) => last.sequence - current.sequence);

    if (reverse) {
      events.reverse();
    }

    return events.slice(0, limit);
  }
}
