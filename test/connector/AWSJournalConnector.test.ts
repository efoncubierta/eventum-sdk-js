// tslint:disable:no-unused-expression
import * as UUID from "uuid";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// Eventum dependencies
import { EventKey } from "../../src";
import { AWSJournalConnector } from "../../src/connector/aws/AWSJournalConnector";

// test dependencies
import { AWSMock } from "../mock/aws";
import { TestDataGenerator } from "../util/TestDataGenerator";
import { JournalConnector } from "../../src/connector/JournalConnector";

let journalConnector: JournalConnector;

function awsJournalConnectorTests() {
  describe("AWSJournalConnector", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      // enable AWS mock
      AWSMock.enableMock();

      journalConnector = new AWSJournalConnector();
    });

    after(() => {
      // restore AWS mock
      AWSMock.restoreMock();
    });

    it("getJournal() should return null for a random aggregateId", () => {
      const aggregateId = TestDataGenerator.randomAggregateId();

      return journalConnector.getJournal(aggregateId).then((journalOpt) => {
        chai.should().exist(journalOpt);
        journalOpt.isNone().should.be.true;
      });
    });
  });
}

export default awsJournalConnectorTests;
