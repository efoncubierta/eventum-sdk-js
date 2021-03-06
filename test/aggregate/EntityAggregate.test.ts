// tslint:disable:no-unused-expression
import * as UUID from "uuid";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum-sdk-js dependencies
import { ConnectorFactory } from "../../src/connector/ConnectorFactory";

// test dependencies
import { AWSMock } from "../mock/aws";
import { TestDataGenerator } from "../util/TestDataGenerator";

// example model for testing
import { EntityAggregate } from "../../examples/entity-aggregate/EntityAggregate";
import { Entity } from "../../examples/entity-aggregate/Entity";

const aggregateConfig = TestDataGenerator.getAggregateConfig();

function entityAggregateTests() {
  describe("EntityAggregate", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      // enable AWS mock
      AWSMock.enableMock();
    });

    after(() => {
      // restore AWS mock
      AWSMock.restoreMock();
    });

    it("should go through the life cycle", () => {
      const uuid = TestDataGenerator.randomUUID();
      const entity = TestDataGenerator.randomEntity();

      return EntityAggregate.build(uuid, aggregateConfig).then((entityAggregate) => {
        const initialEntity = entityAggregate.get();
        chai.should().not.exist(initialEntity);

        return entityAggregate
          .create(entity.property1, entity.property2, entity.property3)
          .then((currentEntity) => {
            chai.should().exist(currentEntity);
            currentEntity.uuid.should.exist;
            currentEntity.uuid.should.be.equal(uuid);
            currentEntity.property1.should.exist;
            currentEntity.property1.should.be.equal(entity.property1);
            currentEntity.property2.should.exist;
            currentEntity.property2.should.be.equal(entity.property2);
            currentEntity.property3.should.exist;
            currentEntity.property3.should.be.equal(entity.property3);

            return entityAggregate.delete();
          })
          .then((currentEntity) => {
            chai.should().not.exist(currentEntity);
            return;
          });
      });
    });

    it("delete() should be rejected on a new entity", () => {
      const uuid = TestDataGenerator.randomUUID();

      return EntityAggregate.build(uuid, aggregateConfig).then((entityAggregate) => {
        const initialEntity = entityAggregate.get();
        chai.should().not.exist(initialEntity);

        return entityAggregate.delete().should.be.rejected;
      });
    });

    it("should rehydrate from data store", () => {
      const numberOfUpdates = 5;
      const uuid = TestDataGenerator.randomUUID();
      const firstEntity = TestDataGenerator.randomEntity(uuid);
      const secondEntity = TestDataGenerator.randomEntity(uuid);

      return EntityAggregate.build(uuid, aggregateConfig).then((entityAggregate) => {
        return entityAggregate
          .create(firstEntity.property1, firstEntity.property2, firstEntity.property3)
          .then((currentEntity) => {
            chai.should().exist(currentEntity);

            // update entity N times
            const promises = Array<Promise<Entity>>();
            for (let i = 0; i < numberOfUpdates; i++) {
              promises.push(
                entityAggregate.update(firstEntity.property1, firstEntity.property2, firstEntity.property3)
              );
            }

            return Promise.all(promises);
          })
          .then((entities) => {
            chai.should().exist(entities);
            entities.length.should.equal(numberOfUpdates);

            // last update with different data
            return entityAggregate.update(secondEntity.property1, secondEntity.property2, secondEntity.property3);
          })
          .then((currentEntity) => {
            chai.should().exist(currentEntity);

            // create new aggregate that should rehydrate
            return EntityAggregate.build(uuid, aggregateConfig);
          })
          .then((entityAggregate2) => {
            chai.should().exist(entityAggregate2);

            const currentEntity = entityAggregate2.get();
            chai.should().exist(currentEntity);
            currentEntity.uuid.should.exist;
            currentEntity.uuid.should.be.equal(uuid);
            currentEntity.property1.should.exist;
            currentEntity.property1.should.be.equal(secondEntity.property1);
            currentEntity.property2.should.exist;
            currentEntity.property2.should.be.equal(secondEntity.property2);
            currentEntity.property3.should.exist;
            currentEntity.property3.should.be.equal(secondEntity.property3);
          });
      });
    });

    it("should automatically create snapshots", () => {
      const numberOfUpdates = 10;
      const uuid = TestDataGenerator.randomUUID();
      const entity = TestDataGenerator.randomEntity();

      return EntityAggregate.build(uuid, aggregateConfig).then((entityAggregate) => {
        return entityAggregate
          .create(entity.property1, entity.property2, entity.property3)
          .then((currentEntity) => {
            chai.should().exist(currentEntity);

            // update entity N times
            const promises = Array<Promise<Entity>>();
            for (let i = 0; i < numberOfUpdates; i++) {
              promises.push(entityAggregate.update(entity.property1, entity.property2, entity.property3));
            }

            return Promise.all(promises);
          })
          .then((entities) => {
            chai.should().exist(entities);
            entities.length.should.equal(numberOfUpdates);

            // create new aggregate that should rehydrate
            return ConnectorFactory.getJournalConnector().getJournal(uuid);
          })
          .then((currentJournalOpt) => {
            chai.should().exist(currentJournalOpt);
            currentJournalOpt.isSome().should.be.true;

            const j = currentJournalOpt.getOrElse(undefined);
            chai.should().exist(j);
            j.snapshot.should.exist;

            const numberEvents = numberOfUpdates + 1; // 1 x create + 30 x update
            const configDelta = aggregateConfig.snapshot.delta;
            const snapshotDelta = numberEvents % configDelta;
            const snapshotSequence = numberEvents - snapshotDelta;

            j.snapshot.sequence.should.equal(snapshotSequence);
            j.events.length.should.equal(snapshotDelta);
          });
      });
    });
  });
}

export default entityAggregateTests;
