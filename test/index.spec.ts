import "mocha";

// eventum dependencies
import { Eventum, EventumProvider } from "../src";

// test dependencies
import aggregateFSMTests from "./AggregateFSM.test";
import aggregateTests from "./Aggregate.test";

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
  aggregateFSMTests();
});
