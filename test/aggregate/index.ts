import "mocha";

// test dependencies
import entityAggregateTests from "./EntityAggregate.test";
import stateAggregateTests from "./StateAggregate.test";

function aggregateTests() {
  describe("Aggregate", () => {
    entityAggregateTests();
    stateAggregateTests();
  });
}

export default aggregateTests;
