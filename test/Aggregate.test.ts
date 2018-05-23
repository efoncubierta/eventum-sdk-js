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
import { EntityAggregate } from "./example/EntityAggregate";
import { Entity } from "./example/Entity";

const aggregateConfig = TestDataGenerator.getAggregateConfig();

function aggregateTest() {
  describe("Aggregate", () => {
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
      const entityAggregate = new EntityAggregate(aggregateId, aggregateConfig);
      const createEntity = TestDataGenerator.randomCreateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      entityAggregate
        .rehydrate()
        .then((entity) => {
          chai.should().not.exist(entity);

          return entityAggregate.handle(getEntity);
        })
        .then((entity) => {
          chai.should().not.exist(entity);

          return entityAggregate.handle(createEntity);
        })
        .then((entity) => {
          chai.should().exist(entity);
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
        .then((entity) => {
          chai.should().exist(entity);

          return entityAggregate.handle(deleteEntity);
        })
        .then((entity) => {
          chai.should().not.exist(entity);
          return;
        })
        .then(done)
        .catch(done);
    });

    it("should reject a delete command on a new entity", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregate(aggregateId, aggregateConfig);
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      entityAggregate.rehydrate().then((entity) => {
        chai.should().not.exist(entity);

        entityAggregate.handle(deleteEntity).should.be.rejected;
        done();
      });
    });

    it("should rehydrate from data store", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregate(aggregateId, aggregateConfig);
      const createEntity = TestDataGenerator.randomCreateEntity();
      const updateEntity = TestDataGenerator.randomUpdateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      entityAggregate
        .rehydrate()
        .then((entity) => {
          chai.should().not.exist(entity);

          return entityAggregate.handle(createEntity);
        })
        .then((entity) => {
          chai.should().exist(entity);

          return entityAggregate.handle(updateEntity);
        })
        .then((entity) => {
          chai.should().exist(entity);

          // create new aggregate that should rehydrate
          const entityAggregate2 = new EntityAggregate(aggregateId, aggregateConfig);
          return entityAggregate2.rehydrate();
        })
        .then((entity) => {
          chai.should().exist(entity);
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
      const entityAggregate = new EntityAggregate(aggregateId, aggregateConfig);
      const notSupportedCommand = TestDataGenerator.randomNotSupportedCommand();

      entityAggregate.rehydrate().then((entity) => {
        entityAggregate.handle(notSupportedCommand).should.be.rejected;
        done();
      });
    });
  });
}

export default aggregateTest;
