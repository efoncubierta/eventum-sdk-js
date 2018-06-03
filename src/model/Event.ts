import { Nullable } from "../types/Nullable";

export type EventType = string;
export type EventPayload = any;

/**
 * An event represents a side effect in the system. It indicates that something has changed.
 * Events are emited by aggregates and sagas.
 *
 * Events are grouped by aggregate and sorted by sequence.
 */
export interface Event {
  readonly eventType: EventType;
  readonly aggregateId: string;
  readonly sequence: number;
  readonly occurredAt: string;
  readonly payload?: Nullable<EventPayload>;
}

export type EventKey = Pick<Event, "aggregateId" | "sequence">;

export type EventInput = Pick<Event, "eventType" | "aggregateId" | "payload">;
