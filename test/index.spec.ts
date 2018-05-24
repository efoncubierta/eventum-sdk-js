import "mocha";
import * as path from "path";

import { Eventum } from "../src";

// test dependencies
import aggregateFSMTest from "./AggregateFSM.test";
import aggregateTest from "./Aggregate.test";

// configure eventum for testing
Eventum.setConfigFile(path.join(__dirname, "eventum.yml"));

describe("Eventum SDK", () => {
  aggregateTest();
  aggregateFSMTest();
});
