// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum-sdk-js dependencies
import { New, Active, Deleted, AggregateError } from "../src";
import { ConnectorFactory } from "../src/connector/ConnectorFactory";

// test dependencies
import { AWSMock } from "./mock/aws";
import { TestDataGenerator } from "./util/TestDataGenerator";

// example model for testing
import { EntityAggregateFSM, EntityState } from "../examples/entity-aggregatefsm/EntityAggregateFSM";
import { Entity } from "../examples/entity-aggregate/Entity";

const aggregateConfig = TestDataGenerator.getAggregateConfig();

function aggregateFSMTest() {
  describe("AggregateFSM", () => {
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
      const aggregateId = TestDataGenerator.randomUUID();
      const createEntity = TestDataGenerator.randomCreateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      return EntityAggregateFSM.build(aggregateId, aggregateConfig).then((entityAggregate) => {
        return entityAggregate
          .handle(getEntity)
          .then((entityState) => {
            entityState.should.exist;
            entityState.stateName.should.be.equal(New.STATE_NAME);

            return entityAggregate.handle(createEntity);
          })
          .then((entityState) => {
            entityState.should.exist;
            entityState.stateName.should.be.equal(Active.STATE_NAME);

            const entity = (entityState as Active<Entity>).payload;
            entity.uuid.should.exist;
            entity.uuid.should.be.equal(aggregateId);
            entity.property1.should.exist;
            entity.property1.should.be.equal(createEntity.property1);
            entity.property2.should.exist;
            entity.property2.should.be.equal(createEntity.property2);
            entity.property3.should.exist;
            entity.property3.should.be.equal(createEntity.property3);

            return entityAggregate.handle(getEntity);
          })
          .then((entityState) => {
            entityState.should.exist;
            entityState.stateName.should.be.equal(Active.STATE_NAME);

            return entityAggregate.handle(deleteEntity);
          })
          .then((entityState) => {
            entityState.should.exist;
            entityState.stateName.should.be.equal(Deleted.STATE_NAME);
          });
      });
    });

    it("should reject a delete command on a new entity", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntty = TestDataGenerator.randomDeleteEntity();

      return EntityAggregateFSM.build(aggregateId, aggregateConfig).then((entityAggregate) => {
        return entityAggregate.handle(getEntity).then((entityState) => {
          entityState.should.exist;
          entityState.stateName.should.be.equal(New.STATE_NAME);

          return entityAggregate.handle(deleteEntty).should.be.rejected;
        });
      });
    });

    it("should rehydrate from data store", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const createEntity = TestDataGenerator.randomCreateEntity();
      const updateEntity = TestDataGenerator.randomUpdateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      return EntityAggregateFSM.build(aggregateId, aggregateConfig).then((entityAggregate) => {
        return entityAggregate
          .handle(createEntity)
          .then((entityState) => {
            entityState.should.exist;
            entityState.stateName.should.be.equal(Active.STATE_NAME);

            return entityAggregate.handle(updateEntity);
          })
          .then((entityState) => {
            entityState.should.exist;
            entityState.stateName.should.be.equal(Active.STATE_NAME);

            // create new aggregate that should rehydrate
            return EntityAggregateFSM.build(aggregateId, aggregateConfig);
          })
          .then((entityAggregate2) => {
            entityAggregate2.should.exist;
            return entityAggregate2.handle(getEntity);
          })
          .then((entityState) => {
            entityState.should.exist;
            entityState.stateName.should.be.equal(Active.STATE_NAME);

            // validate rehydrated entity
            const entity = (entityState as Active<Entity>).payload;
            entity.uuid.should.exist;
            entity.uuid.should.be.equal(aggregateId);
            entity.property1.should.exist;
            entity.property1.should.be.equal(updateEntity.property1);
            entity.property2.should.exist;
            entity.property2.should.be.equal(updateEntity.property2);
            entity.property3.should.exist;
            entity.property3.should.be.equal(updateEntity.property3);
          });
      });
    });

    it("should automatically create snapshots", () => {
      const numberUpdates = 10;
      const aggregateId = TestDataGenerator.randomUUID();
      const createEntity = TestDataGenerator.randomCreateEntity();
      const updateEntity = TestDataGenerator.randomUpdateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();

      return EntityAggregateFSM.build(aggregateId, aggregateConfig).then((entityAggregate) => {
        return entityAggregate
          .handle(createEntity)
          .then((entityState) => {
            entityState.should.exist;
            entityState.stateName.should.be.equal(Active.STATE_NAME);

            // update entity N times
            const promises = Array<Promise<EntityState>>();
            for (let i = 0; i < numberUpdates; i++) {
              promises.push(entityAggregate.handle(updateEntity));
            }

            return Promise.all(promises);
          })
          .then((entityStates) => {
            entityStates.should.exist;
            entityStates.length.should.equal(numberUpdates);

            // create new aggregate that should rehydrate
            return ConnectorFactory.getJournalConnector().getJournal(aggregateId);
          })
          .then((journal) => {
            chai.should().exist(journal);
            journal.snapshot.should.exist;

            const numberEvents = numberUpdates + 1; // 1 x create + 30 x update
            const configDelta = aggregateConfig.snapshot.delta;
            const snapshotDelta = numberEvents % configDelta;
            const snapshotSequence = numberEvents - snapshotDelta;

            journal.snapshot.sequence.should.equal(snapshotSequence);
            journal.events.length.should.equal(snapshotDelta);
          });
      });
    });

    it("should reject a command that is not supported", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const getEntity = TestDataGenerator.randomGetEntity();
      const notSupportedCommand = TestDataGenerator.randomNotSupportedCommand();

      return EntityAggregateFSM.build(aggregateId, aggregateConfig).then((entityAggregate) => {
        return entityAggregate.handle(getEntity).then((entityState) => {
          return entityAggregate.handle(notSupportedCommand).should.be.rejected;
        });
      });
    });
  });
}

export default aggregateFSMTest;
