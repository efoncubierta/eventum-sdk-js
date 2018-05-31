import * as faker from "faker";

import { Entity } from "../../examples/entity-aggregate/Entity";
import { EntityCreated } from "../../examples/entity-aggregate/EntityCreated";
import { EntityUpdated } from "../../examples/entity-aggregate/EntityUpdated";
import { EntityDeleted } from "../../examples/entity-aggregate/EntityDeleted";
import { AggregateConfig } from "../../src";

export class TestDataGenerator {
  public static randomEntity(uuid?: string): Entity {
    return {
      uuid: uuid || this.randomUUID(),
      property1: faker.lorem.sentence(),
      property2: faker.lorem.sentence(),
      property3: faker.random.number(1000)
    };
  }

  public static randomEntityCreated(sequence?: number): EntityCreated {
    return new EntityCreated(this.randomDate(), this.randomUUID(), sequence ? sequence : this.randomSequence(), {
      property1: faker.lorem.sentence(),
      property2: faker.lorem.sentence(),
      property3: faker.random.number(1000)
    });
  }

  public static randomEntityUpdated(sequence?: number): EntityUpdated {
    return new EntityUpdated(this.randomDate(), this.randomUUID(), sequence ? sequence : this.randomSequence(), {
      property1: faker.lorem.sentence(),
      property2: faker.lorem.sentence(),
      property3: faker.random.number(1000)
    });
  }

  public static randomEntityDeleted(sequence?: number): EntityDeleted {
    return new EntityDeleted(this.randomDate(), this.randomUUID(), sequence ? sequence : this.randomSequence());
  }

  public static randomSequence(): number {
    return faker.random.number(1000);
  }

  public static randomEmail(): string {
    return faker.internet.email();
  }

  public static randomUsername(): string {
    return faker.random.word().replace(" ", "");
  }

  public static randomUUID(): string {
    return faker.random.uuid();
  }

  public static randomDate(): string {
    return faker.date.past().toISOString();
  }

  public static getAggregateConfig(): AggregateConfig {
    return {
      snapshot: {
        delta: faker.random.number({ min: 2, max: 5 })
      }
    };
  }
}
