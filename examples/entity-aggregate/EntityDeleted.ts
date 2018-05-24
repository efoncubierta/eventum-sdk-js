import { Event } from "../../src/model/Event";

export class EntityDeleted extends Event<{}> {
  public static readonly EVENT_TYPE = "EntityDeleted";

  constructor(aggregateId: string, sequence: number) {
    super(EntityDeleted.EVENT_TYPE, aggregateId, sequence);
  }
}
