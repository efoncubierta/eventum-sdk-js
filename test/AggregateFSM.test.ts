// tslint:disable:no-unused-expression
import * as UUID from "uuid";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum-sdk-js dependencies
import { New, Active, Deleted, AggregateError } from "../src";

// test dependencies
import { AWSMock } from "./mock/aws";
import { TestDataGenerator } from "./util/TestDataGenerator";
import { EntityAggregateFSM } from "./example/EntityAggregateFSM";
import { Entity } from "./example/Entity";

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

    it("should go through the life cycle", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregateFSM(aggregateId, aggregateConfig);
      const createEntity = TestDataGenerator.randomCreateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      entityAggregate
        .rehydrate()
        .then((entityState) => {
          entityState.should.exist;
          entityState.stateName.should.be.equal(New.STATE_NAME);

          return entityAggregate.handle(getEntity);
        })
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
          return;
        })
        .then(done)
        .catch(done);
    });

    it("should reject a delete command on a new entity", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregateFSM(aggregateId, aggregateConfig);
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntty = TestDataGenerator.randomDeleteEntity();

      entityAggregate.rehydrate().then((entityState) => {
        entityState.should.exist;
        entityState.stateName.should.be.equal(New.STATE_NAME);

        entityAggregate.handle(deleteEntty).should.be.rejected;
        done();
      });
    });

    it("should rehydrate from data store", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregateFSM(aggregateId, aggregateConfig);
      const createEntity = TestDataGenerator.randomCreateEntity();
      const updateEntity = TestDataGenerator.randomUpdateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      entityAggregate
        .rehydrate()
        .then((entityState) => {
          entityState.should.exist;
          entityState.stateName.should.be.equal(New.STATE_NAME);

          return entityAggregate.handle(createEntity);
        })
        .then((entityState) => {
          entityState.should.exist;
          entityState.stateName.should.be.equal(Active.STATE_NAME);

          return entityAggregate.handle(updateEntity);
        })
        .then((entityState) => {
          entityState.should.exist;
          entityState.stateName.should.be.equal(Active.STATE_NAME);

          // create new aggregate that should rehydrate
          const entityAggregate2 = new EntityAggregateFSM(aggregateId, aggregateConfig);
          return entityAggregate2.rehydrate();
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

          return;
        })
        .then(done)
        .catch(done);
    });

    it("should reject a command that is not supported", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregateFSM(aggregateId, aggregateConfig);
      const notSupportedCommand = TestDataGenerator.randomNotSupportedCommand();

      entityAggregate.rehydrate().then((entityState) => {
        entityAggregate.handle(notSupportedCommand).should.be.rejected;
        done();
      });
    });
  });
}

export default aggregateFSMTest;
