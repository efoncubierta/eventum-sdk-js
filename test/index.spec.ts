import "mocha";

// eventum dependencies
import { Eventum } from "../src";

// test dependencies
import aggregateFSMTest from "./AggregateFSM.test";
import aggregateTest from "./Aggregate.test";

describe("Eventum SDK", () => {
  before(() => {
    Eventum.config({
      stage: "test"
    });
  });

  after(() => {
    Eventum.resetConfig();
  });

  aggregateTest();
  aggregateFSMTest();
});
