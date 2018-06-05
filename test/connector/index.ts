import "mocha";

// test dependencies
import awsJournalConnectorTests from "./AWSJournalConnector.test";

function connectorTests() {
  describe("Connector", () => {
    awsJournalConnectorTests();
  });
}

export default connectorTests;
