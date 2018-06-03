// Eventum SDK dependencies
import { Aggregate, AggregateConfig, Snapshot, AggregateFSM, Event, State } from "../../src";

import { Entity } from "../entity-aggregate/Entity";
import { EntityEventType } from "../entity-aggregate/EntityEventType";
import { EntityStateName } from "../entity-aggregatefsm/EntityStateName";

type EntityState = State<Entity>;

interface IEntityAggregateFSM {
  create(property1: string, property2: string, property3: number): Promise<EntityState>;
  update(property1: string, property2: string, property3: number): Promise<EntityState>;
  delete(): Promise<EntityState>;
}

export class EntityAggregateFSM extends AggregateFSM<Entity, EntityState> implements IEntityAggregateFSM {
  private currentState: EntityState = {
    stateName: EntityStateName.New
  };

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
      case EntityStateName.New:
        return this.emit({
          eventType: EntityEventType.EntityCreated,
          aggregateId: this.aggregateId,
          payload: {
            property1,
            property2,
            property3
          }
        });
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} already exists.`));
    }
  }

  public update(property1: string, property2: string, property3: number): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case EntityStateName.Active:
        return this.emit({
          eventType: EntityEventType.EntityUpdated,
          aggregateId: this.aggregateId,
          payload: {
            property1,
            property2,
            property3
          }
        });
      default:
        return Promise.reject(new Error(`Can't change the email on a non-existent or deleted node.`));
    }
  }

  public delete(): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case EntityStateName.Active:
        return this.emit({
          eventType: EntityEventType.EntityDeleted,
          aggregateId: this.aggregateId
        });
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} doesn't exist and cannot be deleted`));
    }
  }

  protected aggregateSnapshot(snapshot: Snapshot) {
    this.currentState = snapshot.payload;
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
    this.currentState = {
      stateName: EntityStateName.Active,
      payload: entity
    };
  }

  private aggregateEntityUpdated(event: Event) {
    const entity = Entity.builder(this.currentState.payload)
      .property1(event.payload.property1)
      .property2(event.payload.property2)
      .property3(event.payload.property3)
      .build();
    this.currentState = {
      stateName: EntityStateName.Active,
      payload: entity
    };
  }

  private aggregateEntityDeleted(event: Event) {
    const entity = this.currentState.payload;
    this.currentState = {
      stateName: EntityStateName.Deleted,
      payload: entity
    };
  }
}
