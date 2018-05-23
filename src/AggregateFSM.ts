import { AggregateConfig } from "./AggregateConfig";
import { Aggregate } from "./Aggregate";
import { Command } from "./model/Command";
import { Event } from "./model/Event";
import { State } from "./model/State";

export abstract class AggregateFSM<T, S extends State<T>, C extends Command, E extends Event<any>> extends Aggregate<
  S,
  C,
  E
> {
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
