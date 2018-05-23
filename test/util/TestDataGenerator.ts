import * as faker from "faker";

import { GetEntity } from "../example/GetEntity";
import { CreateEntity } from "../example/CreateEntity";
import { UpdateEntity } from "../example/UpdateEntity";
import { DeleteEntity } from "../example/DeleteEntity";
import { EntityCreated } from "../example/EntityCreated";
import { EntityUpdated } from "../example/EntityUpdated";
import { EntityDeleted } from "../example/EntityDeleted";
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
        interval: 10
      }
    };
  }
}
