import { AggregateConfig } from "./AggregateConfig";

// models
import { Command } from "../model/Command";
import { Snapshot } from "../model/Snapshot";
import { Event } from "../model/Event";

// connectors
import { JournalConnector } from "../connector/JournalConnector";
import { ConnectorFactory } from "../connector/ConnectorFactory";

export interface IAggregate<T, C extends Command> {
  handle(command: C): Promise<T>;
}

export abstract class Aggregate<T, C extends Command, E extends Event<any>> implements IAggregate<T, C> {
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

  public abstract handle(command: C): Promise<T>;

  protected abstract getEntity(): T;

  protected abstract aggregateEvent(event: E);

  protected abstract aggregateSnapshot(snapshot: Snapshot<T>);

  protected getLastSequence() {
    return this.lastSequence;
  }

  protected getNextSequence() {
    return ++this.lastSequence;
  }

  protected aggregate(msg: E | Snapshot<T>) {
    switch (msg.messageType) {
      case Event.MESSAGE_TYPE:
        this.lastSequence = msg.sequence;
        this.aggregateEvent(msg as E);
        break;
      case Snapshot.MESSAGE_TYPE:
        this.lastSnapshotSequence = msg.sequence;
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
          return this.journalConnector.saveSnapshot(this.aggregateId, this.lastSequence, this.getEntity());
        }
      })
      .then(() => {
        return this.getEntity();
      });
  }
}
