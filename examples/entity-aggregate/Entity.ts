// tslint:disable:max-classes-per-file
interface EntityDefinition {
  uuid: string;
  property1: string;
  property2: string;
  property3: number;
}

class EntityBuilder {
  private e: EntityDefinition;

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
    return new Entity(this.e);
  }
}

export class Entity implements EntityDefinition {
  public readonly uuid: string;
  public readonly property1: string;
  public readonly property2: string;
  public readonly property3: number;

  public constructor(def: EntityDefinition) {
    this.uuid = def.uuid;
    this.property1 = def.property1;
    this.property2 = def.property2;
    this.property3 = def.property3;
  }

  public static builder(entity?: Entity): EntityBuilder {
    return new EntityBuilder(entity);
  }
}
