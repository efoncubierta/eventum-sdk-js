// Eventum SDK dependencies
import { Aggregate, AggregateConfig, Snapshot, Event } from "../../src";

import { Entity } from "./Entity";
import { EntityEventType } from "./EntityEventType";

interface IEntityAggregate {
  create(property1: string, property2: string, property3: number): Promise<Entity>;
  update(property1: string, property2: string, property3: number): Promise<Entity>;
  delete(): Promise<Entity>;
}

export class EntityAggregate extends Aggregate<Entity> implements IEntityAggregate {
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

    return this.emit({
      eventType: EntityEventType.EntityCreated,
      aggregateId: this.aggregateId,
      payload: {
        property1,
        property2,
        property3
      }
    });
  }

  public update(property1: string, property2: string, property3: number): Promise<Entity> {
    if (this.currentEntity === null) {
      return Promise.reject(new Error(`Can't update a non-existent or deleted entity.`));
    }

    return this.emit({
      eventType: EntityEventType.EntityUpdated,
      aggregateId: this.aggregateId,
      payload: {
        property1,
        property2,
        property3
      }
    });
  }

  public delete(): Promise<Entity> {
    if (!this.currentEntity) {
      return Promise.reject(new Error(`Entity ${this.aggregateId} doesn't exist and cannot be deleted`));
    }

    return this.emit({
      eventType: EntityEventType.EntityDeleted,
      aggregateId: this.aggregateId
    });
  }

  protected aggregateSnapshot(snapshot: Snapshot) {
    this.currentEntity = snapshot.payload;
  }

  protected aggregateEvent(event: Event) {
    switch (event.eventType) {
      case EntityEventType.EntityCreated:
        this.aggregateEntityCreated(event);
        break;
      case EntityEventType.EntityUpdated:
        this.aggregateEntityUpdated(event);
        break;
      case EntityEventType.EntityDeleted:
        this.aggregateEntityDeleted(event);
        break;
      default:
        return Promise.reject(new Error(`Event ${event.eventType} not supported by EntityAggregate.`));
    }
  }

  private aggregateEntityCreated(event: Event) {
    const entity = Entity.builder()
      .uuid(event.aggregateId)
      .property1(event.payload.property1)
      .property2(event.payload.property2)
      .property3(event.payload.property3)
      .build();
    this.currentEntity = entity;
  }

  private aggregateEntityUpdated(event: Event) {
    const entity = Entity.builder(this.currentEntity)
      .property1(event.payload.property1)
      .property2(event.payload.property2)
      .property3(event.payload.property3)
      .build();
    this.currentEntity = entity;
  }

  private aggregateEntityDeleted(event: Event) {
    this.currentEntity = null;
  }
}
