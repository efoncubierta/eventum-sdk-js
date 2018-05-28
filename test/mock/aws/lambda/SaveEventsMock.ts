// in-memory connectors
import { InMemoryJournalConnector } from "../../../../src/connector/inmemory/InMemoryJournalConnector";

// model
import { Event } from "../../../../src/model/Event";

import { AWSLambdaInvokeMock } from "./AWSLambdaInvokeMock";

/**
 * Mock for the 'saveEvents' lambda function.
 */
export class SaveEventsMock implements AWSLambdaInvokeMock {
  public static FUNCTION_NAME = "eventum-test-api-saveEvents";

  private journalConnector = new InMemoryJournalConnector();

  public getFunctionName(): string {
    return SaveEventsMock.FUNCTION_NAME;
  }

  public handle(params, callback: (error?: Error, response?: any) => void): void {
    const jsonPayload = JSON.parse(params.Payload);
    const events: Array<Event<any>> = jsonPayload.events;

    this.journalConnector.saveEvents(events).then(() => {
      callback(null, {
        StatusCode: 200,
        Payload: JSON.stringify({
          $type: "Success"
        })
      });
    });
  }
}
