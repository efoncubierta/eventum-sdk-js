export class AggregateError extends Error {
  public readonly aggregateId: string;

  constructor(aggregateId: string, message: string) {
    super(message);
    this.aggregateId = aggregateId;
  }
}
