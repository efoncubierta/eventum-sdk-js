import { AggregateConfig } from "./AggregateConfig";
import { Aggregate } from "./Aggregate";

// models
import { Event } from "../model/Event";
import { State } from "../model/State";

export abstract class AggregateFSM<T, S extends State<T>, E extends Event<any>> extends Aggregate<S, E> {
  /**
   * Constructor.
   *
   * @param aggregateId - Aggregate ID
   * @param config - Aggregate configuration
   */
  protected constructor(aggregateId: string, config?: AggregateConfig) {
    super(aggregateId, config);
  }
}
