import { Entity } from "./Entity";
import { EntityCreated } from "./EntityCreated";
import { EntityDeleted } from "./EntityDeleted";
import { EntityUpdated } from "./EntityUpdated";

import { New, Aggregate, Active, Deleted, AggregateConfig, Snapshot } from "../../src";

export type EntityEvent = EntityCreated | EntityDeleted | EntityUpdated;

interface IEntityAggregate {
  create(property1: string, property2: string, property3: number): Promise<Entity>;
  update(property1: string, property2: string, property3: number): Promise<Entity>;
  delete(): Promise<Entity>;
}

export class EntityAggregate extends Aggregate<Entity, EntityEvent> implements IEntityAggregate {
  private currentEntity: Entity;

  /**
   * Constructor.
   *
   * @param uuid - Entity UUID
   * @param config - Aggregate configuration
   */
  protected constructor(uuid: string, config: AggregateConfig) {
    super(uuid, config);
  }

  public static build(uuid: string, config: AggregateConfig): Promise<EntityAggregate> {
    const aggregate = new EntityAggregate(uuid, config);
    return aggregate.rehydrate().then(() => {
      return aggregate;
    });
  }

  public get(): Entity {
    return this.currentEntity;
  }

  public create(property1: string, property2: string, property3: number): Promise<Entity> {
    if (this.currentEntity) {
      throw new Error(`Entity ${this.aggregateId} already exists.`);
    }

    const event = new EntityCreated(new Date().toISOString(), this.aggregateId, this.getNextSequence(), {
      property1,
      property2,
      property3
    });

    return this.save(event);
  }

  public update(property1: string, property2: string, property3: number): Promise<Entity> {
    if (this.currentEntity === null) {
      return Promise.reject(new Error(`Can't update a non-existent or deleted entity.`));
    }

    const event = new EntityUpdated(new Date().toISOString(), this.aggregateId, this.getNextSequence(), {
      property1,
      property2,
      property3
    });

    return this.save(event);
  }

  public delete(): Promise<Entity> {
    if (!this.currentEntity) {
      return Promise.reject(new Error(`Entity ${this.aggregateId} doesn't exist and cannot be deleted`));
    }

    const event = new EntityDeleted(new Date().toISOString(), this.aggregateId, this.getNextSequence());

    return this.save(event);
  }

  protected aggregateSnapshot(snapshot: Snapshot<Entity>) {
    this.currentEntity = snapshot.payload;
  }

  protected aggregateEvent(event: EntityEvent) {
    switch (event.eventType) {
      case EntityCreated.EVENT_TYPE:
        this.aggregateEntityCreated(event as EntityCreated);
        break;
      case EntityUpdated.EVENT_TYPE:
        this.aggregateEntityUpdated(event as EntityUpdated);
        break;
      case EntityDeleted.EVENT_TYPE:
        this.aggregateEntityDeleted(event as EntityDeleted);
        break;
      default:
        return Promise.reject(new Error(`Event ${event.eventType} not supported by EntityAggregate.`));
    }
  }

  private aggregateEntityCreated(event: EntityCreated) {
    const entity = Entity.builder()
      .uuid(event.aggregateId)
      .property1(event.payload.property1)
      .property2(event.payload.property2)
      .property3(event.payload.property3)
      .build();
    this.currentEntity = entity;
  }

  private aggregateEntityUpdated(event: EntityUpdated) {
    const entity = Entity.builder(this.currentEntity)
      .property1(event.payload.property1)
      .property2(event.payload.property2)
      .property3(event.payload.property3)
      .build();
    this.currentEntity = entity;
  }

  private aggregateEntityDeleted(event: EntityDeleted) {
    this.currentEntity = null;
  }
}
