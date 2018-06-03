import { AggregateConfig } from "./AggregateConfig";
import { Aggregate } from "./Aggregate";

// models
import { State } from "../model/State";

export abstract class AggregateFSM<T, S extends State<T>> extends Aggregate<S> {
  /**
   * Constructor.
   *
   * @param aggregateId - Aggregate ID
   * @param config - Aggregate configuration
   */
  protected constructor(aggregateId: string, config: AggregateConfig) {
    super(aggregateId, config);
  }
}
