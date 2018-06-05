import { AggregateConfig } from "./AggregateConfig";

// models
import { Snapshot } from "../model/Snapshot";
import { Event, EventInput } from "../model/Event";

// connectors
import { ConnectorFactory } from "../connector/ConnectorFactory";
import { JournalConnector } from "../connector/JournalConnector";

export abstract class Aggregate<T> {
  // aggregate configuration
  protected readonly aggregateId: string;
  protected readonly config: AggregateConfig;

  // connectors
  private readonly journalConnector: JournalConnector;

  // control variables
  private lastSequence: number = 0;
  private lastSnapshotSequence: number = 0;

  /**
   * Constructor.
   *
   * @param aggregateId - Aggregate ID
   * @param config - Aggregate configuration
   */
  protected constructor(aggregateId: string, config: AggregateConfig) {
    this.aggregateId = aggregateId;
    this.config = config;

    // TODO validate config

    this.journalConnector = ConnectorFactory.getJournalConnector();
  }

  protected abstract get(): T;

  protected abstract aggregateEvent(event: Event): void;

  protected abstract aggregateSnapshot(snapshot: Snapshot): void;

  protected getLastSequence() {
    return this.lastSequence;
  }

  protected getNextSequence() {
    return ++this.lastSequence;
  }

  private aggregateEventInternal(event: Event) {
    this.lastSequence = event.sequence;
    this.aggregateEvent(event);
  }

  private aggregateSnapshotInternal(snapshot: Snapshot) {
    this.lastSnapshotSequence = snapshot.sequence;
    this.aggregateSnapshot(snapshot);
  }

  protected async rehydrate() {
    // get journal
    await this.journalConnector.getJournal(this.aggregateId).then((journalOpt) => {
      journalOpt.mapNullable((journal) => {
        // aggregate the snapshot if any
        if (journal.snapshot) {
          this.aggregateSnapshotInternal(journal.snapshot);
        }

        // aggregate each event
        if (journal.events && Array.isArray(journal.events)) {
          journal.events.forEach((event) => this.aggregateEventInternal(event));
        }
      });
    });
  }

  /**
   * Save an event.
   *
   * @param eventInput Event
   */
  protected emit(eventInput: EventInput): Promise<T> {
    return this.emitAll([eventInput]);
  }

  /**
   * Save a list of events.
   *
   * @param eventInputs List of events
   */
  protected emitAll(eventInputs: EventInput[]): Promise<T> {
    return this.journalConnector
      .saveEvents(eventInputs)
      .then((events) => {
        // aggregate saved events that belongs to this aggregate
        events.forEach((event) => {
          if (event.aggregateId === this.aggregateId) {
            this.aggregateEventInternal(event);
          }
        });

        // save snapshot if the events delta to the last snapshot is higher or equal to
        // the delta valued configured
        const delta = this.lastSequence - this.lastSnapshotSequence;
        if (delta >= this.config.snapshot.delta) {
          this.lastSnapshotSequence = this.lastSequence;
          return this.journalConnector.saveSnapshot({
            aggregateId: this.aggregateId,
            sequence: this.lastSequence,
            payload: this.get()
          });
        }
      })
      .then(() => {
        return this.get();
      });
  }
}
