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

// example model for testing
import { EntityAggregate } from "../examples/entity-aggregate/EntityAggregate";
import { Entity } from "../examples/entity-aggregate/Entity";

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
      const createEntity = TestDataGenerator.randomCreateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      EntityAggregate.build(aggregateId, aggregateConfig)
        .then((entityAggregate) => {
          return entityAggregate
            .handle(getEntity)

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
            });
        })
        .then(done)
        .catch(done);
    });

    it("should reject a delete command on a new entity", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      EntityAggregate.build(aggregateId, aggregateConfig)
        .then((entityAggregate) => {
          entityAggregate.handle(getEntity).then((entity) => {
            chai.should().not.exist(entity);

            entityAggregate.handle(deleteEntity).should.be.rejected;
            done();
          });
        })
        .catch(done);
    });

    it("should rehydrate from data store", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const createEntity = TestDataGenerator.randomCreateEntity();
      const updateEntity = TestDataGenerator.randomUpdateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      EntityAggregate.build(aggregateId, aggregateConfig)
        .then((entityAggregate) => {
          entityAggregate
            .handle(createEntity)
            .then((entity) => {
              chai.should().exist(entity);

              return entityAggregate.handle(updateEntity);
            })
            .then((entity) => {
              chai.should().exist(entity);

              // create new aggregate that should rehydrate
              return EntityAggregate.build(aggregateId, aggregateConfig);
            })
            .then((entityAggregate2) => {
              chai.should().exist(entityAggregate2);
              return entityAggregate2.handle(getEntity);
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
            });
        })
        .then(done)
        .catch(done);
    });

    it("should reject a command that is not supported", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const getEntity = TestDataGenerator.randomGetEntity();
      const notSupportedCommand = TestDataGenerator.randomNotSupportedCommand();

      EntityAggregate.build(aggregateId, aggregateConfig)
        .then((entityAggregate) => {
          entityAggregate.handle(getEntity).then((entity) => {
            entityAggregate.handle(notSupportedCommand).should.be.rejected;
            done();
          });
        })
        .catch(done);
    });
  });
}

export default aggregateTest;
