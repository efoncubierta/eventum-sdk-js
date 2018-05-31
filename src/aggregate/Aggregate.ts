import { AggregateConfig } from "./AggregateConfig";

// models
import { Message } from "../model/Message";
import { Snapshot } from "../model/Snapshot";
import { Event } from "../model/Event";

// connectors
import { JournalConnector } from "../connector/JournalConnector";
import { ConnectorFactory } from "../connector/ConnectorFactory";

export abstract class Aggregate<T, E extends Event<any>> {
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
  protected constructor(aggregateId: string, config?: AggregateConfig) {
    this.aggregateId = aggregateId;
    this.config = config;

    // TODO validate config

    this.journalConnector = ConnectorFactory.getJournalConnector();
  }

  protected abstract get(): T;

  protected abstract aggregateEvent(event: E);

  protected abstract aggregateSnapshot(snapshot: Snapshot<T>);

  protected getLastSequence() {
    return this.lastSequence;
  }

  protected getNextSequence() {
    return ++this.lastSequence;
  }

  private aggregate(msg: Message) {
    switch (msg.messageType) {
      case Event.MESSAGE_TYPE:
        this.lastSequence = (msg as Event<any>).sequence;
        this.aggregateEvent(msg as E);
        break;
      case Snapshot.MESSAGE_TYPE:
        this.lastSnapshotSequence = (msg as Snapshot<any>).sequence;
        this.aggregateSnapshot(msg as Snapshot<T>);
        break;
      default:
        throw new Error(`Only events and snapshots can be aggregagated`);
    }
  }

  protected async rehydrate() {
    // get journal
    await this.journalConnector.getJournal(this.aggregateId).then((journal) => {
      if (journal) {
        // aggregate the snapshot if found
        if (journal.snapshot) {
          this.aggregate(journal.snapshot);
        }

        // aggregate each event
        if (journal.events && Array.isArray(journal.events)) {
          journal.events.forEach((event) => this.aggregate(event));
        }
      }
    });
  }

  /**
   * Save an event.
   *
   * @param event Event
   */
  protected save(event: E): Promise<T> {
    return this.saveAll([event]);
  }

  /**
   * Save a list of events.
   *
   * @param events List of events
   */
  protected saveAll(events: E[]): Promise<T> {
    return this.journalConnector
      .saveEvents(events)
      .then(() => {
        // aggregate saved events that belongs to this aggregate
        events.forEach((event) => {
          if (event.aggregateId === this.aggregateId) {
            this.aggregate(event);
          }
        });

        // save snapshot if the events delta to the last snapshot is higher or equal to
        // the delta valued configured
        const delta = this.lastSequence - this.lastSnapshotSequence;
        if (delta >= this.config.snapshot.delta) {
          this.lastSnapshotSequence = this.lastSequence;
          return this.journalConnector.saveSnapshot(this.aggregateId, this.lastSequence, this.get());
        }
      })
      .then(() => {
        return this.get();
      });
  }
}
