import { Entity, EntityBuilder } from "../entity-aggregate/Entity";
import { GetEntity } from "../entity-aggregate/GetEntity";
import { CreateEntity } from "../entity-aggregate/CreateEntity";
import { UpdateEntity } from "../entity-aggregate/UpdateEntity";
import { DeleteEntity } from "../entity-aggregate/DeleteEntity";
import { EntityCreated } from "../entity-aggregate/EntityCreated";
import { EntityDeleted } from "../entity-aggregate/EntityDeleted";
import { EntityUpdated } from "../entity-aggregate/EntityUpdated";

import { New, Aggregate, Active, Deleted, AggregateConfig, Snapshot, AggregateError, AggregateFSM } from "../../src";

export type EntityCommand = GetEntity | CreateEntity | UpdateEntity | DeleteEntity;
export type EntityEvent = EntityCreated | EntityDeleted | EntityUpdated;
export type EntityState = New<Entity> | Active<Entity> | Deleted<Entity>;

export class EntityAggregateFSM extends AggregateFSM<Entity, EntityState, EntityCommand, EntityEvent> {
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

  protected getEntity(): EntityState {
    return this.currentState;
  }

  public handle(command: EntityCommand): Promise<EntityState> {
    switch (command.commandType) {
      case GetEntity.COMMAND_TYPE:
        return this.handleGetEntity(command as GetEntity);
      case CreateEntity.COMMAND_TYPE:
        return this.handleCreateEntity(command as CreateEntity);
      case UpdateEntity.COMMAND_TYPE:
        return this.handleUpdateEntity(command as UpdateEntity);
      case DeleteEntity.COMMAND_TYPE:
        return this.handleDeleteEntity(command as DeleteEntity);
      default:
        return Promise.reject(new Error(`Command ${command.commandType} not supported by EntityAggregate.`));
    }
  }

  private handleGetEntity(command: GetEntity): Promise<EntityState> {
    return Promise.resolve(this.getEntity());
  }

  private handleCreateEntity(command: CreateEntity): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case New.STATE_NAME:
        const event = new EntityCreated(this.aggregateId, this.getNextSequence(), {
          property1: command.property1,
          property2: command.property2,
          property3: command.property3
        });
        return this.save(event).then(() => {
          this.aggregateEvent(event);
          return this.getEntity();
        });
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} already exists.`));
    }
  }

  private handleUpdateEntity(command: UpdateEntity): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case Active.STATE_NAME:
        const event = new EntityUpdated(this.aggregateId, this.getNextSequence(), {
          property1: command.property1,
          property2: command.property2,
          property3: command.property3
        });

        return this.save(event).then(() => {
          this.aggregateEvent(event);
          return this.getEntity();
        });
      default:
        return Promise.reject(new Error(`Can't change the email on a non-existent or deleted node.`));
    }
  }

  private handleDeleteEntity(command: DeleteEntity): Promise<EntityState> {
    switch (this.currentState.stateName) {
      case Active.STATE_NAME:
        const event = new EntityDeleted(this.aggregateId, this.getNextSequence());

        return this.save(event).then(() => {
          this.aggregateEvent(event);
          return this.getEntity();
        });
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
    const entity = new EntityBuilder()
      .uuid(event.aggregateId)
      .property1(event.payload.property1)
      .property2(event.payload.property2)
      .property3(event.payload.property3)
      .build();
    this.currentState = new Active(entity);
  }

  private aggregateEntityUpdated(event: EntityUpdated) {
    const entity = new EntityBuilder((this.currentState as Active<Entity>).payload)
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
