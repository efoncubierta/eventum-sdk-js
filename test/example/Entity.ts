export interface Entity {
  uuid: string;
  property1: string;
  property2: string;
  property3: number;
}

export class EntityBuilder {
  private e: Entity;

  constructor(entity?: Entity) {
    this.e = entity ? entity : ({} as Entity);
  }

  public uuid(uuid: string): EntityBuilder {
    this.e.uuid = uuid;
    return this;
  }

  public property1(property1: string): EntityBuilder {
    this.e.property1 = property1;
    return this;
  }

  public property2(property2: string): EntityBuilder {
    this.e.property2 = property2;
    return this;
  }

  public property3(property3: number): EntityBuilder {
    this.e.property3 = property3;
    return this;
  }

  public build(): Entity {
    return this.e;
  }
}
