// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum-sdk-js dependencies
import { ConnectorFactory } from "../../src/connector/ConnectorFactory";
import { State } from "../../src";

// test dependencies
import { AWSMock } from "../mock/aws";
import { TestDataGenerator } from "../util/TestDataGenerator";

// example model for testing
import { EntityStateAggregate } from "../../examples/entitystate-aggregate/EntityStateAggregate";
import { EntityStateName } from "../../examples/entitystate-aggregate/EntityStateName";
import { Entity } from "../../examples/entity-aggregate/Entity";

const aggregateConfig = TestDataGenerator.getAggregateConfig();

function stateAggregateTests() {
  describe("StateAggregate", () => {
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
      const entity = TestDataGenerator.randomEntity(uuid);

      return EntityStateAggregate.build(uuid, aggregateConfig).then((entityAggregate) => {
        const initialState = entityAggregate.get();
        initialState.should.exist;
        initialState.stateName.should.be.equal(EntityStateName.New);

        return entityAggregate
          .create(entity.property1, entity.property2, entity.property3)
          .then((currentState) => {
            currentState.should.exist;
            currentState.stateName.should.be.equal(EntityStateName.Active);

            const currentEntity = currentState.payload;
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
          .then((currentState) => {
            currentState.should.exist;
            currentState.stateName.should.be.equal(EntityStateName.Deleted);
          });
      });
    });

    it("delete() should be rejected on a new entity", () => {
      const uuid = TestDataGenerator.randomUUID();

      return EntityStateAggregate.build(uuid, aggregateConfig).then((entityAggregate) => {
        const initialState = entityAggregate.get();
        initialState.should.exist;
        initialState.stateName.should.be.equal(EntityStateName.New);

        return entityAggregate.delete().should.be.rejected;
      });
    });

    it("should rehydrate from data store", () => {
      const uuid = TestDataGenerator.randomUUID();
      const firstEntity = TestDataGenerator.randomEntity(uuid);
      const secondEntity = TestDataGenerator.randomEntity(uuid);

      return EntityStateAggregate.build(firstEntity.uuid, aggregateConfig).then((entityAggregate) => {
        return entityAggregate
          .create(firstEntity.property1, firstEntity.property2, firstEntity.property3)
          .then((currentState) => {
            currentState.should.exist;
            currentState.stateName.should.be.equal(EntityStateName.Active);

            return entityAggregate.update(secondEntity.property1, secondEntity.property2, secondEntity.property3);
          })
          .then((currentState) => {
            currentState.should.exist;
            currentState.stateName.should.be.equal(EntityStateName.Active);

            // create new aggregate that should rehydrate
            return EntityStateAggregate.build(uuid, aggregateConfig);
          })
          .then((entityAggregate2) => {
            entityAggregate2.should.exist;

            const currentState = entityAggregate2.get();
            currentState.should.exist;
            currentState.stateName.should.be.equal(EntityStateName.Active);

            // validate rehydrated entity
            const currentEntity = currentState.payload;
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
      const numberUpdates = 10;
      const aggregateId = TestDataGenerator.randomUUID();
      const entity = TestDataGenerator.randomEntity();

      return EntityStateAggregate.build(aggregateId, aggregateConfig).then((entityAggregate) => {
        const initialState = entityAggregate.get();
        initialState.should.exist;
        initialState.stateName.should.be.equal(EntityStateName.New);

        return entityAggregate
          .create(entity.property1, entity.property2, entity.property3)
          .then((currentState) => {
            currentState.should.exist;
            currentState.stateName.should.be.equal(EntityStateName.Active);

            // update entity N times
            const promises = Array<Promise<State<Entity>>>();
            for (let i = 0; i < numberUpdates; i++) {
              promises.push(entityAggregate.update(entity.property1, entity.property2, entity.property3));
            }

            return Promise.all(promises);
          })
          .then((entityStates) => {
            entityStates.should.exist;
            entityStates.length.should.equal(numberUpdates);

            // create new aggregate that should rehydrate
            return ConnectorFactory.getJournalConnector().getJournal(aggregateId);
          })
          .then((currentJournalOpt) => {
            chai.should().exist(currentJournalOpt);
            currentJournalOpt.isSome().should.be.true;

            const j = currentJournalOpt.getOrElse(undefined);
            chai.should().exist(j);
            j.snapshot.should.exist;

            const numberEvents = numberUpdates + 1; // 1 x create + 30 x update
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

export default stateAggregateTests;
