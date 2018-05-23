import { Entity, EntityBuilder } from "./Entity";
import { GetEntity } from "./GetEntity";
import { CreateEntity } from "./CreateEntity";
import { UpdateEntity } from "./UpdateEntity";
import { DeleteEntity } from "./DeleteEntity";
import { EntityCreated } from "./EntityCreated";
import { EntityDeleted } from "./EntityDeleted";
import { EntityUpdated } from "./EntityUpdated";

import { New, Aggregate, Active, Deleted, AggregateConfig, Snapshot, AggregateError } from "../../src";

export type EntityCommand = GetEntity | CreateEntity | UpdateEntity | DeleteEntity;
export type EntityEvent = EntityCreated | EntityDeleted | EntityUpdated;

export class EntityAggregate extends Aggregate<Entity, EntityCommand, EntityEvent> {
  private currentEntity: Entity;

  /**
   * Constructor.
   *
   * @param uuid - Entity UUID
   * @param config - Aggregate configuration
   */
  constructor(uuid: string, config: AggregateConfig) {
    super(uuid, config);
  }

  protected getEntity(): Entity {
    return this.currentEntity;
  }

  public handle(command: EntityCommand): Promise<Entity> {
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

  private handleGetEntity(command: GetEntity): Promise<Entity> {
    return Promise.resolve(this.getEntity());
  }

  private handleCreateEntity(command: CreateEntity): Promise<Entity> {
    if (this.currentEntity) {
      throw new Error(`Entity ${this.aggregateId} already exists.`);
    }

    const event = new EntityCreated(this.aggregateId, this.getNextSequence(), {
      property1: command.property1,
      property2: command.property2,
      property3: command.property3
    });
    return this.save(event).then(() => {
      this.aggregateEvent(event);
      return this.getEntity();
    });
  }

  private handleUpdateEntity(command: UpdateEntity): Promise<Entity> {
    if (this.currentEntity === null) {
      return Promise.reject(new Error(`Can't update a non-existent or deleted entity.`));
    }

    const event = new EntityUpdated(this.aggregateId, this.getNextSequence(), {
      property1: command.property1,
      property2: command.property2,
      property3: command.property3
    });

    return this.save(event).then(() => {
      this.aggregateEvent(event);
      return this.getEntity();
    });
  }

  private handleDeleteEntity(command: DeleteEntity): Promise<Entity> {
    if (!this.currentEntity) {
      return Promise.reject(new Error(`Entity ${this.aggregateId} doesn't exist and cannot be deleted`));
    }

    const event = new EntityDeleted(this.aggregateId, this.getNextSequence());
    return this.save(event).then(() => {
      this.aggregateEvent(event);
      return this.getEntity();
    });
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
    const entity = new EntityBuilder()
      .uuid(event.aggregateId)
      .property1(event.payload.property1)
      .property2(event.payload.property2)
      .property3(event.payload.property3)
      .build();
    this.currentEntity = entity;
  }

  private aggregateEntityUpdated(event: EntityUpdated) {
    const entity = new EntityBuilder(this.currentEntity)
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
