// Eventum SDK dependencies
import { Aggregate, AggregateConfig, Snapshot, Event, State, EventInput } from "../../src";

import { Entity } from "../entity-aggregate/Entity";
import { EntityEventType, EntityCreatedPayload, EntityUpdatedPayload } from "../entity-aggregate/EntityEvent";
import { EntityStateName } from "../entitystate-aggregate/EntityStateName";

type EntityState = State<Entity>;

interface IEntityStateAggregate {
  create(property1: string, property2: string, property3: number): Promise<EntityState>;
  update(property1: string, property2: string, property3: number): Promise<EntityState>;
  delete(): Promise<EntityState>;
}

export class EntityStateAggregate extends Aggregate<EntityState> implements IEntityStateAggregate {
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

  public static build(uuid: string, config: AggregateConfig): Promise<EntityStateAggregate> {
    const aggregate = new EntityStateAggregate(uuid, config);
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
        const entityEventPayload: EntityCreatedPayload = {
          property1,
          property2,
          property3
        };
        const entityEvent: EventInput = {
          aggregateId: this.aggregateId,
          source: "eventum",
          authority: "eventum",
          eventType: EntityEventType.EntityCreated,
          payload: entityEventPayload
        };
        return this.emit(entityEvent);
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} already exists.`));
    }
  }

  public update(property1: string, property2: string, property3: number): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case EntityStateName.Active:
        const entityEventPayload: EntityUpdatedPayload = {
          property1,
          property2,
          property3
        };

        const entityEvent: EventInput = {
          aggregateId: this.aggregateId,
          source: "eventum",
          authority: "eventum",
          eventType: EntityEventType.EntityUpdated,
          payload: entityEventPayload
        };

        return this.emit(entityEvent);
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} does not exist or has been deleted.`));
    }
  }

  public delete(): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case EntityStateName.Active:
        const entityEvent: EventInput = {
          aggregateId: this.aggregateId,
          source: "eventum",
          authority: "eventum",
          eventType: EntityEventType.EntityDeleted
        };

        return this.emit(entityEvent);
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
