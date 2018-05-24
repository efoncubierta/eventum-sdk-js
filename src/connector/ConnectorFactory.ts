import { Eventum } from "../Eventum";
import { EventumProvider } from "../config/EventumConfig";

// connectors
import { JournalConnector } from "./JournalConnector";
import { AWSJournalConnector } from "./aws/AWSJournalConnector";
import { InMemoryJournalConnector } from "./inmemory/InMemoryJournalConnector";

/**
 * Create connector instances for the Eventum provider configured in {@link Eventum.config()}.
 */
export class ConnectorFactory {
  /**
   * Create a {@link JournalConnector} instance for the provider configured.
   *
   * If there is no journal connector for the provider configured, it will throw an exception.
   *
   * @returns Journal connector
   */
  public static getJournalConnector(): JournalConnector {
    switch (Eventum.config().provider) {
      case EventumProvider.AWS:
        return new AWSJournalConnector();
      case EventumProvider.INMEMORY:
        return new InMemoryJournalConnector();
      default:
        throw new Error(`JournalConnector not available for ${Eventum.config().provider}`);
    }
  }
}
