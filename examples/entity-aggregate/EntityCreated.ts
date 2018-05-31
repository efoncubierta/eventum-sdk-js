import { Event } from "../../src/model/Event";

export interface EntityCreatedPayload {
  property1: string;
  property2: string;
  property3: number;
}

export class EntityCreated extends Event<EntityCreatedPayload> {
  public static readonly EVENT_TYPE = "EntityCreated";

  constructor(occurredAt: string, aggregateId: string, sequence: number, payload: EntityCreatedPayload) {
    super(EntityCreated.EVENT_TYPE, occurredAt, aggregateId, sequence, payload);
  }
}
