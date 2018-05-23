import "mocha";

import { Eventum } from "../src";

// test dependencies
import aggregateFSMTest from "./AggregateFSM.test";
import aggregateTest from "./Aggregate.test";

// configure eventum for testing
Eventum.setConfigFile("test/eventum.yml");

describe("Eventum SDK", () => {
  aggregateTest();
  aggregateFSMTest();
});
