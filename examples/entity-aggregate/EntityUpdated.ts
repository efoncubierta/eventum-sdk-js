import { Event } from "../../src/model/Event";

export interface EntityUpdatedPayload {
  property1: string;
  property2: string;
  property3: number;
}

export class EntityUpdated extends Event<EntityUpdatedPayload> {
  public static readonly EVENT_TYPE = "EntityUpdated";

  constructor(aggregateId: string, sequence: number, payload: EntityUpdatedPayload) {
    super(EntityUpdated.EVENT_TYPE, aggregateId, sequence, payload);
  }
}