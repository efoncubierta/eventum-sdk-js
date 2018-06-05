// Eventum AWS provider dependencies
import { EventumResponseType } from "../../../../src/connector/EventumResponseType";

// Eventum in-memory connectors
import { InMemoryJournalConnector } from "../../../../src/connector/inmemory/InMemoryJournalConnector";

// Eventum models
import { Event, EventInput } from "../../../../src/model/Event";

// Eventum test dependencies
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
    const eventInputs: EventInput[] = jsonPayload;

    this.journalConnector.saveEvents(eventInputs).then((events) => {
      callback(null, {
        StatusCode: 200,
        Payload: JSON.stringify({
          type: EventumResponseType.OK,
          payload: events
        })
      });
    });
  }
}
