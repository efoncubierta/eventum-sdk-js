import "mocha";

// eventum dependencies
import { Eventum } from "../src";

// test dependencies
import aggregateFSMTests from "./AggregateFSM.test";
import aggregateTests from "./Aggregate.test";

describe("Eventum SDK", () => {
  before(() => {
    Eventum.config({
      stage: "test"
    });
  });

  after(() => {
    Eventum.resetConfig();
  });

  aggregateTests();
  aggregateFSMTests();
});
