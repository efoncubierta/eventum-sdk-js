import * as faker from "faker";

import { Entity } from "../../examples/entity-aggregate/Entity";
import { AggregateConfig } from "../../src";
import { EntityCreatedPayload, EntityUpdatedPayload } from "../../examples/entity-aggregate/EntityEventType";

export class TestDataGenerator {
  public static randomEntity(uuid?: string): Entity {
    return {
      uuid: uuid || this.randomUUID(),
      property1: faker.lorem.sentence(),
      property2: faker.lorem.sentence(),
      property3: faker.random.number(1000)
    };
  }

  public static randomEntityCreatedPayload(sequence?: number): EntityCreatedPayload {
    return {
      property1: faker.lorem.sentence(),
      property2: faker.lorem.sentence(),
      property3: faker.random.number(1000)
    };
  }

  public static randomEntityUpdatedPayload(sequence?: number): EntityUpdatedPayload {
    return {
      property1: faker.lorem.sentence(),
      property2: faker.lorem.sentence(),
      property3: faker.random.number(1000)
    };
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
