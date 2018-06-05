// Eventum AWS provider dependencies
import { EventumResponseType } from "../../../../src/connector/EventumResponseType";
import { EventumErrorType } from "../../../../src/connector/EventumErrorType";

// Eventum in-memory connectors
import { InMemoryJournalConnector } from "../../../../src/connector/inmemory/InMemoryJournalConnector";

// Eventum models
import { Journal } from "../../../../src/model/Journal";

// Eventum test dependencies
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

    this.journalConnector.getJournal(aggregateId).then((journalOpt) => {
      journalOpt.foldL(
        () => {
          callback(null, {
            StatusCode: 200,
            Payload: JSON.stringify({
              type: EventumResponseType.ERROR,
              errorType: EventumErrorType.NotFound
            })
          });
        },
        (journal) => {
          callback(null, {
            StatusCode: 200,
            Payload: JSON.stringify({
              type: EventumResponseType.OK,
              payload: journalOpt.getOrElse(null)
            })
          });
        }
      );
    });
  }
}
