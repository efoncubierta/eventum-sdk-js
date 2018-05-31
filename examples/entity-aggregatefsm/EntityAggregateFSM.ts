import { Entity } from "../entity-aggregate/Entity";
import { EntityCreated } from "../entity-aggregate/EntityCreated";
import { EntityDeleted } from "../entity-aggregate/EntityDeleted";
import { EntityUpdated } from "../entity-aggregate/EntityUpdated";

import { New, Aggregate, Active, Deleted, AggregateConfig, Snapshot, AggregateFSM } from "../../src";

export type EntityEvent = EntityCreated | EntityDeleted | EntityUpdated;
export type EntityState = New<Entity> | Active<Entity> | Deleted<Entity>;

interface IEntityAggregateFSM {
  create(property1: string, property2: string, property3: number): Promise<EntityState>;
  update(property1: string, property2: string, property3: number): Promise<EntityState>;
  delete(): Promise<EntityState>;
}

export class EntityAggregateFSM extends AggregateFSM<Entity, EntityState, EntityEvent> implements IEntityAggregateFSM {
  private currentState: EntityState = new New();

  /**
   * Constructor.
   *
   * @param uuid - Entity UUID
   * @param config - Aggregate configuration
   */
  protected constructor(uuid: string, config: AggregateConfig) {
    super(uuid, config);
  }

  public static build(uuid: string, config: AggregateConfig): Promise<EntityAggregateFSM> {
    const aggregate = new EntityAggregateFSM(uuid, config);
    return aggregate.rehydrate().then(() => {
      return aggregate;
    });
  }

  public get(): EntityState {
    return this.currentState;
  }

  public create(property1: string, property2: string, property3: number): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case New.STATE_NAME:
        const event = new EntityCreated(new Date().toISOString(), this.aggregateId, this.getNextSequence(), {
          property1,
          property2,
          property3
        });
        return this.save(event);
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} already exists.`));
    }
  }

  public update(property1: string, property2: string, property3: number): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case Active.STATE_NAME:
        const event = new EntityUpdated(new Date().toISOString(), this.aggregateId, this.getNextSequence(), {
          property1,
          property2,
          property3
        });

        return this.save(event);
      default:
        return Promise.reject(new Error(`Can't change the email on a non-existent or deleted node.`));
    }
  }

  public delete(): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case Active.STATE_NAME:
        const event = new EntityDeleted(new Date().toISOString(), this.aggregateId, this.getNextSequence());

        return this.save(event);
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} doesn't exist and cannot be deleted`));
    }
  }

  protected aggregateSnapshot(snapshot: Snapshot<EntityState>) {
    this.currentState = snapshot.payload;
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
    this.currentState = new Active(entity);
  }

  private aggregateEntityUpdated(event: EntityUpdated) {
    const entity = Entity.builder((this.currentState as Active<Entity>).payload)
      .property1(event.payload.property1)
      .property2(event.payload.property2)
      .property3(event.payload.property3)
      .build();
    this.currentState = new Active(entity);
  }

  private aggregateEntityDeleted(event: EntityDeleted) {
    const entity = (this.currentState as Active<Entity>).payload;
    this.currentState = new Deleted(entity);
  }
}
