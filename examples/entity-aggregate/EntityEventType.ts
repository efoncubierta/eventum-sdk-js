export enum EntityEventType {
  EntityCreated = "EntityCreated",
  EntityUpdated = "EntityUpdated",
  EntityDeleted = "EntityDeleted"
}

export interface EntityCreatedPayload {
  property1: string;
  property2: string;
  property3: number;
}

export interface EntityUpdatedPayload {
  property1: string;
  property2: string;
  property3: number;
}
