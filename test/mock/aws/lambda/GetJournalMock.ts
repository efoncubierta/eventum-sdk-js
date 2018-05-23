import { AWSLambdaInvokeMock } from "./AWSLambdaInvokeMock";
import { InMemorySnapshotStore } from "../../InMemorySnapshotStore";
import { InMemoryJournalStore } from "../../InMemoryJournalStore";
import { Journal } from "../../../../src/model/Journal";

/**
 * Mock for the 'getJournal' lambda function.
 */
export class GetJournalMock implements AWSLambdaInvokeMock {
  public static FUNCTION_NAME = "getJournal_test";

  public getFunctionName(): string {
    return GetJournalMock.FUNCTION_NAME;
  }

  public handle(params, callback: (error?: Error, response?: any) => void): void {
    const jsonPayload = JSON.parse(params.Payload);
    const aggregateId: string = jsonPayload.aggregateId;

    const snapshot = InMemorySnapshotStore.getLatestSnapshot(aggregateId);
    const events = InMemoryJournalStore.getEvents(aggregateId, snapshot ? snapshot.sequence + 1 : 0);

    callback(null, {
      StatusCode: 200,
      Payload: {
        aggregateId,
        snapshot,
        events
      } as Journal
    });
  }
}
