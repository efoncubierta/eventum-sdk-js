import * as faker from "faker";

import { Entity } from "../../examples/entity-aggregate/Entity";
import { AggregateConfig, Event, Snapshot, EventInput, EventKey, SnapshotId, SnapshotKey } from "../../src";
import { EntityCreatedPayload, EntityUpdatedPayload } from "../../examples/entity-aggregate/EntityEventType";
import { SnapshotInput } from "../../src/model/Snapshot";

export class TestDataGenerator {
  public static randomEvent(aggregateId?: string, sequence?: number): Event {
    return {
      eventId: this.randomUUID(),
      eventType: this.randomEventType(),
      source: faker.random.word(),
      authority: faker.random.word(),
      occurredAt: this.randomDate(),
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence && sequence > 0 ? sequence : this.randomSequence(),
      payload: this.randomPayload()
    };
  }

  public static randomEventArray(size: number, aggregateId?: string, fromSequence?: number): Event[] {
    let seedSequence = fromSequence && fromSequence > 0 ? fromSequence : 1;
    const events: Event[] = [];
    for (let i = 0; i < size; i++, seedSequence++) {
      events.push(this.randomEvent(aggregateId, seedSequence));
    }
    return events;
  }

  public static randomEventKey(aggregateId?: string, sequence?: number): EventKey {
    return {
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence || this.randomSequence()
    };
  }

  public static randomEventInput(aggregateId?: string): EventInput {
    return {
      eventType: this.randomEventType(),
      source: faker.random.word(),
      authority: faker.random.word(),
      aggregateId: aggregateId || this.randomAggregateId(),
      payload: this.randomPayload()
    };
  }

  public static randomEventInputArray(size: number, aggregateId?: string): EventInput[] {
    const events: EventInput[] = [];
    for (let i = 0; i < size; i++) {
      events.push(this.randomEventInput(aggregateId));
    }
    return events;
  }

  public static randomStateType(): string {
    return faker.random.word().replace(" ", "");
  }

  public static randomSnapshot(aggregateId?: string, sequence?: number): Snapshot {
    return {
      snapshotId: this.randomUUID(),
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence && sequence > 0 ? sequence : this.randomSequence(),
      payload: this.randomPayload()
    };
  }

  public static randomSnapshotId(): SnapshotId {
    return this.randomUUID();
  }

  public static randomSnapshotKey(aggregateId?: string, sequence?: number): SnapshotKey {
    return {
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence || this.randomSequence()
    };
  }

  public static randomSnapshotInput(aggregateId?: string, sequence?: number): SnapshotInput {
    return {
      aggregateId: aggregateId || this.randomAggregateId(),
      sequence: sequence && sequence > 0 ? sequence : this.randomSequence(),
      payload: this.randomPayload()
    };
  }

  public static randomSnapshots(size: number, aggregateId?: string, fromSequence?: number): Snapshot[] {
    let seedSequence = fromSequence && fromSequence > 0 ? fromSequence : 0;
    const snapshots: Snapshot[] = [];
    for (let i = 0; i < size; i++, seedSequence++) {
      snapshots.push(this.randomSnapshot(aggregateId, seedSequence));
    }
    return snapshots;
  }

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

  public static randomEventType(): string {
    return faker.random.word().replace(" ", "");
  }

  public static randomAggregateId(): string {
    return faker.random.uuid();
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

  public static randomPayload(): any {
    return {
      prop1: faker.lorem.sentence(),
      prop2: faker.random.number()
    };
  }

  public static getAggregateConfig(): AggregateConfig {
    return {
      snapshot: {
        delta: faker.random.number({ min: 2, max: 5 })
      }
    };
  }
}
