import * as faker from "faker";

import { GetEntity } from "../../examples/entity-aggregate//GetEntity";
import { CreateEntity } from "../../examples/entity-aggregate//CreateEntity";
import { UpdateEntity } from "../../examples/entity-aggregate//UpdateEntity";
import { DeleteEntity } from "../../examples/entity-aggregate//DeleteEntity";
import { EntityCreated } from "../../examples/entity-aggregate//EntityCreated";
import { EntityUpdated } from "../../examples/entity-aggregate//EntityUpdated";
import { EntityDeleted } from "../../examples/entity-aggregate//EntityDeleted";
import { Command, AggregateConfig } from "../../src";

export class TestDataGenerator {
  public static randomGetEntity(): GetEntity {
    return new GetEntity();
  }

  public static randomDeleteEntity(): DeleteEntity {
    return new DeleteEntity();
  }

  public static randomCreateEntity(): CreateEntity {
    return new CreateEntity(faker.lorem.sentence(), faker.lorem.sentence(), faker.random.number(1000));
  }

  public static randomUpdateEntity(): UpdateEntity {
    return new UpdateEntity(faker.lorem.sentence(), faker.lorem.sentence(), faker.random.number(1000));
  }

  public static randomNotSupportedCommand(): Command {
    return {
      messageType: "Command",
      commandType: "NotSupportedCommand"
    };
  }

  public static randomEntityCreated(sequence?: number): EntityCreated {
    return new EntityCreated(this.randomUUID(), sequence ? sequence : this.randomSequence(), {
      property1: faker.lorem.sentence(),
      property2: faker.lorem.sentence(),
      property3: faker.random.number(1000)
    });
  }

  public static randomEntityUpdated(sequence?: number): EntityUpdated {
    return new EntityUpdated(this.randomUUID(), sequence ? sequence : this.randomSequence(), {
      property1: faker.lorem.sentence(),
      property2: faker.lorem.sentence(),
      property3: faker.random.number(1000)
    });
  }

  public static randomEntityDeleted(sequence?: number): EntityDeleted {
    return new EntityDeleted(this.randomUUID(), sequence ? sequence : this.randomSequence());
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

  public static getAggregateConfig(): AggregateConfig {
    return {
      snapshot: {
        delta: faker.random.number({ min: 2, max: 5 })
      }
    };
  }
}
