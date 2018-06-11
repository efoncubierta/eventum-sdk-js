import { Event } from "../../src/model/Event";

export enum EntityEventType {
  EntityCreated = "EntityCreated",
  EntityUpdated = "EntityUpdated",
  EntityDeleted = "EntityDeleted"
}

export interface EntityEvent extends Event {
  readonly eventType: EntityEventType;
}

export interface EntityCreated extends EntityEvent {
  readonly eventType: EntityEventType.EntityCreated;
  readonly payload: EntityCreatedPayload;
}

export interface EntityCreatedPayload {
  property1: string;
  property2: string;
  property3: number;
}

export interface EntityUpdated extends EntityEvent {
  readonly eventType: EntityEventType.EntityUpdated;
  readonly payload: EntityUpdatedPayload;
}

export interface EntityUpdatedPayload {
  property1: string;
  property2: string;
  property3: number;
}

export interface EntityDeleted extends EntityEvent {
  readonly eventType: EntityEventType.EntityDeleted;
}
