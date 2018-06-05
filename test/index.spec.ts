import "mocha";

// eventum dependencies
import { Eventum, EventumProvider } from "../src";

// test dependencies
import aggregateTests from "./aggregate";
import connectorTests from "./connector";

describe("Eventum SDK", () => {
  before(() => {
    Eventum.config({
      provider: EventumProvider.AWS,
      serviceName: "eventum",
      stage: "test",
      aws: {
        lambdas: {
          getJournal: {
            functionName: "api-getJournal"
          },
          saveEvents: {
            functionName: "api-saveEvents"
          },
          saveSnapshot: {
            functionName: "api-saveSnapshot"
          }
        }
      }
    });
  });

  after(() => {
    Eventum.resetConfig();
  });

  aggregateTests();
  connectorTests();
});
