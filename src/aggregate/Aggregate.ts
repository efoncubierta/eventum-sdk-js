import { AggregateConfig } from "./AggregateConfig";
import { Command } from "../model/Command";
import { JournalConnector } from "../connector/JournalConnector";
import { Snapshot } from "../model/Snapshot";
import { Event } from "../model/Event";
import { ConnectorFactory } from "../connector/ConnectorFactory";

export interface IAggregate<T, C extends Command> {
  handle(command: C): Promise<T>;
}

export abstract class Aggregate<T, C extends Command, E extends Event<any>> implements IAggregate<T, C> {
  // aggregate configuration
  protected readonly aggregateId: string;
  protected readonly config: AggregateConfig;

  // stores
  private readonly journalConnector: JournalConnector;

  // last sequence of events
  private lastSequence: number = 0;

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
    return this.lastSequence++;
  }

  protected onRehydrateStarted() {
    // nothing
  }

  protected onRehydrateComplete() {
    // nothing
  }

  protected onRehydrateFailed() {
    // nothing
  }

  protected onSaveFailure() {
    // nothing
  }

  protected aggregate(msg: E | Snapshot<T>) {
    switch (msg.messageType) {
      case Event.MESSAGE_TYPE:
        this.aggregateEvent(msg as E);
        break;
      case Snapshot.MESSAGE_TYPE:
        this.aggregateSnapshot(msg as Snapshot<T>);
        break;
      default:
      // TODO HANDLE ERROR
    }
  }

  protected async rehydrate() {
    // get journal
    await this.journalConnector.getJournal(this.aggregateId).then((journal) => {
      // aggregate the snapshot if found
      if (journal.snapshot) {
        this.aggregate(journal.snapshot);
      }

      // aggregate each event
      if (journal.events && Array.isArray(journal.events)) {
        journal.events.forEach((event) => this.aggregate(event));
      }
    });
  }

  protected save(event: E): Promise<void> {
    return this.saveAll([event]);
  }

  protected saveAll(events: E[]): Promise<void> {
    return this.journalConnector.saveEvents(events);
  }
}
