import { ResponseType } from "../../../../src/connector/aws/ResponseType";

// in-memory connectors
import { InMemoryJournalConnector } from "../../../../src/connector/inmemory/InMemoryJournalConnector";

// model
import { Journal } from "../../../../src/model/Journal";

import { AWSLambdaInvokeMock } from "./AWSLambdaInvokeMock";

/**
 * Mock for the 'getJournal' lambda function.
 */
export class GetJournalMock implements AWSLambdaInvokeMock {
  public static FUNCTION_NAME = "eventum-test-api-getJournal";

  private journalConnector = new InMemoryJournalConnector();

  public getFunctionName(): string {
    return GetJournalMock.FUNCTION_NAME;
  }

  public handle(params, callback: (error?: Error, response?: any) => void): void {
    const jsonPayload = JSON.parse(params.Payload);
    const aggregateId: string = jsonPayload.aggregateId;

    this.journalConnector.getJournal(aggregateId).then((journal) => {
      callback(null, {
        StatusCode: 200,
        Payload: JSON.stringify({
          type: ResponseType.OK,
          payload: journal
        })
      });
    });
  }
}
