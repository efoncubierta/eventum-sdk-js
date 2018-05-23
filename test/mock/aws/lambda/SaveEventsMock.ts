import { AWSLambdaInvokeMock } from "./AWSLambdaInvokeMock";
import { Event } from "../../../../src/model/Event";
import { InMemoryJournalStore } from "../../InMemoryJournalStore";

/**
 * Mock for the 'saveEvents' lambda function.
 */
export class SaveEventsMock implements AWSLambdaInvokeMock {
  public static FUNCTION_NAME = "saveEvents_test";

  public getFunctionName(): string {
    return SaveEventsMock.FUNCTION_NAME;
  }

  public handle(params, callback: (error?: Error, response?: any) => void): void {
    const jsonPayload = JSON.parse(params.Payload);
    const events: Array<Event<any>> = jsonPayload.events;

    events.forEach((event) => {
      InMemoryJournalStore.putEvent(event);
    });

    callback(null, {
      StatusCode: 200,
      Payload: {}
    });
  }
}
